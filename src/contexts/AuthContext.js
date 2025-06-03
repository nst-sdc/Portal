"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Sign up with email and password
  const signUp = async (email, password, options = {}) => {
    try {
      setLoading(true);
      console.log('Attempting sign up with:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options
      });
      console.log('Sign up response:', { data, error });
      return { data, error };
    } catch (error) {
      console.error('Sign up catch error:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      console.log('Attempting sign in with:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      console.log('Sign in response:', { data, error });
      return { data, error };
    } catch (error) {
      console.error('Sign in catch error:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Sign in with OAuth provider
  const signInWithProvider = async (provider, options = {}) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          ...options
        }
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithProvider,
    signOut,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
