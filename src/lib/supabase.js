import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Debug environment variables
if (typeof window !== 'undefined') {

}

// Create Supabase client for authentication and client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'nst-dev-club-portal'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Auth helper functions
export const auth = {
  // Sign up with email and password
  signUp: async (email, password, options = {}) => {
    return await supabase.auth.signUp({
      email,
      password,
      options
    })
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    return await supabase.auth.signInWithPassword({
      email,
      password
    })
  },

  // Sign in with OAuth provider
  signInWithProvider: async (provider, options = {}) => {
    return await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        ...options
      }
    })
  },

  // Sign out
  signOut: async () => {
    return await supabase.auth.signOut()
  },

  // Get current session
  getSession: async () => {
    return await supabase.auth.getSession()
  },

  // Get current user
  getUser: async () => {
    return await supabase.auth.getUser()
  },

  // Listen to auth changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}
