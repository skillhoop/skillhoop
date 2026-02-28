import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrlRaw: string | undefined = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKeyRaw: string | undefined = import.meta.env.VITE_SUPABASE_ANON_KEY

const isValidSupabaseUrl = (url: string) => {
  if (!url) return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

declare global {
  interface Window {
    supabaseDebug?: { url: boolean; key: boolean }
  }
}

if (typeof window !== 'undefined') {
  window.supabaseDebug = {
    url: !!import.meta.env.VITE_SUPABASE_URL,
    key: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  }
}

if (!supabaseUrlRaw || !supabaseAnonKeyRaw) {
  throw new Error('Supabase keys are missing from environment variables.')
}

let supabaseUrl = supabaseUrlRaw.replace(/\/$/, '')
const supabaseAnonKey = supabaseAnonKeyRaw.trim()

if (supabaseUrl && !supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  supabaseUrl = `https://${supabaseUrl}`
}

if (!isValidSupabaseUrl(supabaseUrl)) {
  console.error('Supabase URL appears invalid:', supabaseUrl)
  throw new Error('Supabase URL is invalid.')
}

const createSupabaseClient = (): SupabaseClient => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    db: { schema: 'public' },
    auth: {
      // Persist session in storage but avoid automatic token refresh or URL detection
      persistSession: true,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

let _supabase: SupabaseClient | null = null

export const getSupabaseClient = (): SupabaseClient => {
  if (!_supabase) _supabase = createSupabaseClient()
  return _supabase
}

// Lazily initialize: avoid any auth work at module import time.
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient() as unknown as Record<PropertyKey, unknown>
    const value = client[prop]
    return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(client) : value
  },
}) as SupabaseClient

/**
 * Global helper to determine if a user should be treated as authenticated.
 *
 * Primary source: Supabase SDK session.
 * Fallback: the raw auth token stored in localStorage by the proxy / interceptor.
 */
export const isUserAuthenticated = async (): Promise<boolean> => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      return true
    }
  } catch (error) {
    console.error('Error checking Supabase session:', error)
  }

  // Fallback: manual localStorage token check to avoid false negatives
  if (typeof window !== 'undefined') {
    try {
      const ghostSession = window.localStorage.getItem('skillhoop_ghost_session')
      const rawToken = window.localStorage.getItem('sb-tnbeugqrflocjjjxcceh-auth-token')

      if (ghostSession || rawToken) {
        return true
      }
    } catch (error) {
      console.error('Error accessing localStorage auth token:', error)
    }
  }

  return false
}
