import { createClient } from '@supabase/supabase-js'

// Fallback values (same as in public/js/supabase.js)
const DEFAULT_SUPABASE_URL = 'https://bialelscmftlquykreij.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJpYWxlbHNjbWZ0bHF1eWtyZWlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NzgxMTgsImV4cCI6MjA3NTQ1NDExOH0.wUywvxuTxDlgwVi6y8KaT9E64D4iVRKFFoqUx8wAalI'

// Get Supabase URL and key from environment variables or use defaults
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY).trim()

// Debug logging to verify environment variables are loaded
console.log('🔍 Supabase Configuration Check:', {
  hasEnvUrl: !!import.meta.env.VITE_SUPABASE_URL,
  hasEnvKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  usingUrl: supabaseUrl,
  usingKeyPrefix: supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'missing',
  envUrl: import.meta.env.VITE_SUPABASE_URL,
  envKeyPrefix: import.meta.env.VITE_SUPABASE_ANON_KEY ? import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 20) + '...' : 'missing',
  keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0
})

// Ensure URL has protocol
if (supabaseUrl && !supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  supabaseUrl = `https://${supabaseUrl}`
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase Url or Key missing', { supabaseUrl, supabaseAnonKey: supabaseAnonKey ? '***' : 'missing' })
  throw new Error('Supabase Url or Key missing')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Test Supabase connection and API key validity on initialization
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    if (error.message.includes('Invalid API key') || error.message.includes('JWT')) {
      console.error('❌ INVALID API KEY! Please check your VITE_SUPABASE_ANON_KEY in .env file');
      console.error('Current key prefix:', supabaseAnonKey.substring(0, 30) + '...');
    } else {
      console.warn('⚠️ Supabase session check:', error.message);
    }
  } else {
    console.log('✅ Supabase connection successful');
    if (data.session) {
      console.log('✅ Active session found for user:', data.session.user.email);
    }
  }
}).catch(err => {
  console.error('❌ Supabase connection test failed:', err);
  if (err.message && (err.message.includes('Invalid API key') || err.message.includes('JWT'))) {
    console.error('❌ CRITICAL: Your Supabase API key appears to be invalid!');
    console.error('Please verify your API key in the Supabase dashboard:');
    console.error('1. Go to https://supabase.com/dashboard');
    console.error('2. Select your project: jejhkoslclongslpzxuv');
    console.error('3. Go to Settings → API');
    console.error('4. Copy the "anon public" key');
    console.error('5. Update your .env file with the correct key');
  }
})

// Auth helper functions
export const auth = {
  // Sign up a new user
  async signUp(email: string, password: string, name: string) {
    try {
      const redirectUrl = `${window.location.origin}/login`
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: name,
          }
        }
      })
      
      if (error) {
        console.error('Supabase sign up error:', error)
      }
      
      return { data, error }
    } catch (err) {
      console.error('Sign up exception:', err)
      return { 
        data: null, 
        error: { 
          message: err instanceof Error ? err.message : 'Failed to sign up. Please check your internet connection.' 
        } 
      }
    }
  },

  // Sign in an existing user
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  // Sign out the current user
  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Reset password
  async resetPassword(email: string) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { data, error }
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }
}

