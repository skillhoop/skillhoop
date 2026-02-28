import { createClient } from '@supabase/supabase-js'

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

const supabaseAuthAwareFetch: typeof fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : input.url
  const isAuthRequest = url.includes('/auth/v1')

  try {
    return await fetch(input as RequestInfo, init as RequestInit)
  } catch (err: any) {
    const message = typeof err?.message === 'string' ? err.message : ''

    if (
      isAuthRequest &&
      (message.includes('Failed to fetch') || message.includes('ERR_CONNECTION_TIMED_OUT'))
    ) {
      console.warn('Auth fetch failed, retrying with no-cache...', { url, message })

      await new Promise((resolve) => setTimeout(resolve, 2000))

      const baseHeaders =
        (init && init.headers) ||
        (typeof input !== 'string' ? (input as Request).headers : undefined) ||
        undefined

      const headers = new Headers(baseHeaders as HeadersInit | undefined)
      if (!headers.has('Cache-Control')) headers.set('Cache-Control', 'no-cache')
      if (!headers.has('Pragma')) headers.set('Pragma', 'no-cache')

      const retryInit: RequestInit = {
        ...init,
        headers,
        cache: 'no-store',
      }

      return fetch(input as RequestInfo, retryInit)
    }

    throw err
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

console.log('🔗 Connecting to:', import.meta.env.VITE_SUPABASE_URL)
console.log('🔍 Supabase env loaded:', {
  hasUrl: !!supabaseUrlRaw,
  hasAnonKey: !!supabaseAnonKeyRaw,
})

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

console.log('Supabase Initialized with URL:', supabaseUrl)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: supabaseAuthAwareFetch,
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Lightweight initialization check to surface bad URLs/blocked network early.
supabase.auth
  .getSession()
  .then(({ error }) => {
    if (error) console.warn('⚠️ Supabase session check:', error.message)
  })
  .catch((err) => {
    console.error('❌ Supabase connection test failed:', err)
  })

