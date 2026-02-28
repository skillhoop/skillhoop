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

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: 'public' },
  auth: {
    persistSession: true,
    autoRefreshToken: false, // temporarily off to avoid immediate auth/v1/user pings after server-injected session
    detectSessionInUrl: true,
  },
})
