'use client';

import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../../../../lib/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: { name?: string; email?: string }) => Promise<{ error: AuthError | null }>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  displayName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          setError(error);
        } else {
          setSession(data.session);
          setUser(data.session?.user || null);
        }
      } catch (err) {
        console.error('Error getting initial session:', err);
        setError(err as AuthError);
      } finally {
        setLoading(false);
      }
    };
    getInitialSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
      if (session && error) {
        setError(null);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [error]);

  const signUp = async (email: string, password: string, name?: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: name ? { full_name: name } : undefined
        }
      });
      if (error) {
        setError(error);
        return { error };
      }
      return { error: null };
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      return { error: authError };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      if (error) {
        setError(error);
        return { error };
      }
      return { error: null };
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      return { error: authError };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setError(error);
        return { error };
      }
      setUser(null);
      setSession(null);
      return { error: null };
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      return { error: authError };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });
      if (error) {
        setError(error);
        return { error };
      }
      return { error: null };
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      return { error: authError };
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) {
        setError(error);
        return { error };
      }
      if (data.user) {
        setUser(data.user);
      }
      return { error: null };
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      return { error: authError };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: { name?: string; email?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const updateData: any = {};
      if (updates.email) updateData.email = updates.email;
      if (updates.name) updateData.data = { full_name: updates.name };
      
      const { data, error } = await supabase.auth.updateUser(updateData);
      if (error) {
        setError(error);
        return { error };
      }
      if (data.user) {
        setUser(data.user);
      }
      return { error: null };
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      return { error: authError };
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const isAuthenticated = !!session;
  const isAdmin = user?.user_metadata?.role === 'admin' || user?.app_metadata?.role === 'admin';
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';

  const value: AuthContextType = {
    user,
    session,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    isAuthenticated,
    isAdmin,
    displayName,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

export function useMFA() {
  const { user } = useAuth();

  const enroll = async () => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp'
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error enrolling MFA:', error);
      throw error;
    }
  };

  const challenge = async (factorId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { data, error } = await supabase.auth.mfa.challenge({
        factorId
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating MFA challenge:', error);
      throw error;
    }
  };

  const verify = async (factorId: string, challengeId: string, code: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { data, error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error verifying MFA:', error);
      throw error;
    }
  };

  const unenroll = async (factorId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { data, error } = await supabase.auth.mfa.unenroll({
        factorId
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error unenrolling MFA:', error);
      throw error;
    }
  };

  const listFactors = async () => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error listing MFA factors:', error);
      throw error;
    }
  };

  return {
    enroll,
    challenge,
    verify,
    unenroll,
    listFactors
  };
} 