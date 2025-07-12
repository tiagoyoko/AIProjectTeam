import { supabase } from './client'
import type { 
  AuthResponse, 
  AuthResponsePassword, 
  User, 
  Session,
  AuthError
} from '@supabase/supabase-js';

export interface AuthUser {
  id: string
  email: string
  name?: string
  role?: string
  email_confirmed_at?: string
  phone_confirmed_at?: string
  confirmed_at?: string
  last_sign_in_at?: string
  created_at: string
  updated_at: string
}

export interface AuthSession {
  access_token: string
  refresh_token: string
  expires_in: number
  expires_at?: number
  token_type: string
  user: AuthUser
}

export interface AuthState {
  user: AuthUser | null
  session: AuthSession | null
  loading: boolean
  error: AuthError | null
}

// Client-side authentication functions
export const authClient = {
  // Sign up com email e senha
  async signUp(credentials: { email: string; password: string; name?: string }): Promise<AuthResponse> {
    return await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          name: credentials.name || '',
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
  },

  // Sign in com email e senha
  async signIn(credentials: { email: string; password: string }): Promise<AuthResponsePassword> {
    return await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    });
  },

  // Sign out
  async signOut(): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current session
  async getSession(): Promise<{ data: { session: Session | null }, error: AuthError | null }> {
    const { data, error } = await supabase.auth.getSession()
    return { data, error }
  },

  // Get current user
  async getUser(): Promise<{ data: { user: User | null }, error: AuthError | null }> {
    const { data, error } = await supabase.auth.getUser()
    return { data, error }
  },

  // Reset password
  async resetPassword(email: string): Promise<{ data: {} | null, error: AuthError | null }> {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })

    return { data, error }
  },

  // Update password
  async updatePassword(newPassword: string): Promise<{ data: User | null, error: AuthError | null }> {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    })

    return { data: data?.user || null, error }
  },

  // Update user profile
  async updateProfile(updates: { name?: string; email?: string }): Promise<{ data: User | null, error: AuthError | null }> {
    const { data, error } = await supabase.auth.updateUser({
      data: updates
    })

    return { data: data?.user || null, error }
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// MFA Functions
export const mfaClient = {
  // Enroll MFA
  async enroll(): Promise<{ data: any, error: AuthError | null }> {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp'
    })

    return { data, error }
  },

  // Challenge MFA
  async challenge(factorId: string): Promise<{ data: any, error: AuthError | null }> {
    const { data, error } = await supabase.auth.mfa.challenge({
      factorId
    })

    return { data, error }
  },

  // Verify MFA
  async verify(factorId: string, challengeId: string, code: string): Promise<{ data: any, error: AuthError | null }> {
    const { data, error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code
    })

    return { data, error }
  },

  // Unenroll MFA
  async unenroll(factorId: string): Promise<{ data: any, error: AuthError | null }> {
    const { data, error } = await supabase.auth.mfa.unenroll({
      factorId
    })

    return { data, error }
  },

  // List factors
  async listFactors(): Promise<{ data: any, error: AuthError | null }> {
    const { data, error } = await supabase.auth.mfa.listFactors()
    return { data, error }
  }
}

// OAuth Functions
export const oauthClient = {
  // Sign in with Google
  async signInWithGoogle(): Promise<{ data: any, error: AuthError | null }> {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    return { data, error }
  },

  // Sign in with GitHub
  async signInWithGitHub(): Promise<{ data: any, error: AuthError | null }> {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    return { data, error }
  }
}

// Utility functions
export const authUtils = {
  isAuthenticated(session: Session | null): boolean {
    return !!session?.user
  },

  hasRole(user: User | null, role: string): boolean {
    return user?.user_metadata?.role === role || user?.app_metadata?.role === role
  },

  isAdmin(user: User | null): boolean {
    return this.hasRole(user, 'admin')
  },

  getDisplayName(user: User | null): string {
    return user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário'
  },

  formatAuthError(error: AuthError | null): string {
    if (!error) return ''
    
    switch (error.message) {
      case 'Invalid login credentials':
        return 'Credenciais inválidas'
      case 'User not found':
        return 'Usuário não encontrado'
      case 'Email not confirmed':
        return 'Email não confirmado'
      default:
        return error.message
    }
  }
} 