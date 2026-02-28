import { createClient } from '@supabase/supabase-js'

const supabaseUrlRaw: string | undefined = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKeyRaw: string | undefined = import.meta.env.VITE_SUPABASE_ANON_KEY

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

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
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

