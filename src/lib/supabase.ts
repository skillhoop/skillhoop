import { supabase, isUserAuthenticated } from './supabaseClient'

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

export { supabase, isUserAuthenticated }
