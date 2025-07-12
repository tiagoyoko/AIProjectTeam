'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { 
  SignInSchema, 
  ResetPasswordSchema, 
  UpdatePasswordSchema, 
  UpdateProfileSchema 
} from '@aiprojectteam/shared'
import type { 
  SignUp, 
  SignIn, 
  ResetPassword, 
  UpdatePassword, 
  UpdateProfile 
} from '@aiprojectteam/shared'
import { createServerSupabaseClient, createServerSupabaseUser } from '@/lib/supabase/server'
import { z } from 'zod'

// Schema personalizado para signup sem confirmPassword
const SignUpActionSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  name: z.string().min(1, 'Nome é obrigatório'),
  terms: z.boolean().refine(val => val === true, {
    message: 'Você deve aceitar os termos de uso',
  }),
  confirmPassword: z.string().optional(), // Opcional para não quebrar o FormData
})

interface AuthActionResult {
  success: boolean
  error?: string
  message?: string
}

export async function signUpAction(formData: FormData): Promise<AuthActionResult> {
  console.log('🔥 SERVER: signUpAction INICIADA!')
  console.log('🔥 SERVER: Node.js process PID:', process.pid)
  
  console.log('🔥 signUpAction CHAMADA! Dados recebidos:', {
    email: formData.get('email'),
    name: formData.get('name'),
    hasPassword: !!formData.get('password'),
    hasTerms: !!formData.get('terms')
  })
  
  try {
    // Validar dados com Zod (regra supabase.mdc)
    const rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      name: formData.get('name') as string,
      terms: formData.get('terms') === 'on',
    }

    console.log('🔥 Dados após processamento:', rawData)

    const validatedData = SignUpActionSchema.parse(rawData)
    console.log('🔥 Dados validados com Zod:', validatedData)

    // CORREÇÃO: Usar cliente USER (anon) para Auth operations
    const supabaseUser = await createServerSupabaseUser()
    console.log('🔥 Cliente Supabase User criado para Auth operations')
    
    const { data, error } = await supabaseUser.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
    })

    console.log('🔥 Resultado do auth.signUp:', { 
      hasData: !!data, 
      hasUser: !!data?.user,
      userId: data?.user?.id,
      error: error?.message 
    })

    if (error) {
      console.error('🔥 Erro no auth.signUp:', error)
      return {
        success: false,
        error: formatAuthError(error.message),
      }
    }

    console.log('🔥 Usuário criado no Auth:', { 
      userId: data.user?.id, 
      email: data.user?.email,
      confirmed: data.user?.email_confirmed_at
    })

    // AGORA usar Service Client para operações de database (inserir na tabela)
    if (data.user) {
      console.log('🔥 Iniciando inserção na tabela public.users...')
      
      const supabaseServer = createServerSupabaseClient()
      console.log('🔥 Cliente Supabase Server criado para DB operations')
      
      const insertData = {
        id: data.user.id,
        email: data.user.email!,
        name: validatedData.name,
        role: 'user' as const,
      }
      
      console.log('🔥 Dados para inserção:', insertData)
      
      const { data: insertResult, error: userError } = await supabaseServer
        .from('users')
        .insert(insertData)
        .select()

      console.log('🔥 Resultado da inserção:', { 
        hasResult: !!insertResult,
        result: insertResult,
        error: userError?.message,
        errorDetails: userError
      })

      if (userError) {
        console.error('🔥 Erro ao criar usuário na tabela:', userError)
        // Não retornar erro para o usuário, pois o auth já foi criado
      } else {
        console.log('🔥 Usuário criado na tabela users com sucesso!')
      }
    } else {
      console.error('🔥 ERRO: data.user é undefined')
    }

    console.log('🔥 signUpAction CONCLUÍDA COM SUCESSO!')
    return {
      success: true,
      message: 'Conta criada com sucesso! Verifique seu email para confirmar.',
    }
  } catch (error) {
    console.error('🔥 Erro no signup:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
    }
  }
}

export async function signInAction(formData: FormData): Promise<AuthActionResult> {
  try {
    // Validar dados com Zod (regra supabase.mdc)
    const rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    const validatedData = SignInSchema.parse(rawData)

    // CORREÇÃO: Usar cliente USER (anon) para Auth operations
    const supabaseUser = await createServerSupabaseUser()
    const { data, error } = await supabaseUser.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    })

    if (error) {
      return {
        success: false,
        error: formatAuthError(error.message),
      }
    }

    // Usar Service Client para operações de database
    if (data.user) {
      const supabaseServer = createServerSupabaseClient()
      await supabaseServer
        .from('users')
        .update({ 
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.user.id)
    }

    revalidatePath('/')
    redirect('/dashboard')
  } catch (error) {
    console.error('Erro no signin:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
    }
  }
}

export async function signOutAction(): Promise<AuthActionResult> {
  try {
    // CORREÇÃO: Usar cliente USER (anon) para Auth operations
    const supabaseUser = await createServerSupabaseUser()
    const { error } = await supabaseUser.auth.signOut()

    if (error) {
      return {
        success: false,
        error: formatAuthError(error.message),
      }
    }

    revalidatePath('/')
    redirect('/auth/login')
  } catch (error) {
    console.error('Erro no signout:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
    }
  }
}

export async function resetPasswordAction(formData: FormData): Promise<AuthActionResult> {
  try {
    // Validar dados com Zod (regra supabase.mdc)
    const rawData = {
      email: formData.get('email') as string,
    }

    const validatedData = ResetPasswordSchema.parse(rawData)

    // CORREÇÃO: Usar cliente USER (anon) para Auth operations
    const supabaseUser = await createServerSupabaseUser()
    const { error } = await supabaseUser.auth.resetPasswordForEmail(
      validatedData.email,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
      }
    )

    if (error) {
      return {
        success: false,
        error: formatAuthError(error.message),
      }
    }

    return {
      success: true,
      message: 'Email de recuperação enviado! Verifique sua caixa de entrada.',
    }
  } catch (error) {
    console.error('Erro no reset password:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
    }
  }
}

export async function updatePasswordAction(formData: FormData): Promise<AuthActionResult> {
  try {
    // Validar dados com Zod (regra supabase.mdc)
    const rawData = {
      currentPassword: formData.get('currentPassword') as string,
      newPassword: formData.get('newPassword') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    }

    const validatedData = UpdatePasswordSchema.parse(rawData)

    // CORREÇÃO: Usar cliente USER (anon) para Auth operations
    const supabaseUser = await createServerSupabaseUser()
    
    // Verificar senha atual primeiro
    const { data: { user } } = await supabaseUser.auth.getUser()
    
    if (!user) {
      return {
        success: false,
        error: 'Usuário não autenticado',
      }
    }

    // Tentar fazer login com a senha atual para verificar
    const { error: verifyError } = await supabaseUser.auth.signInWithPassword({
      email: user.email!,
      password: validatedData.currentPassword,
    })

    if (verifyError) {
      return {
        success: false,
        error: 'Senha atual incorreta',
      }
    }

    // Atualizar senha
    const { error } = await supabaseUser.auth.updateUser({
      password: validatedData.newPassword,
    })

    if (error) {
      return {
        success: false,
        error: formatAuthError(error.message),
      }
    }

    return {
      success: true,
      message: 'Senha atualizada com sucesso!',
    }
  } catch (error) {
    console.error('Erro no update password:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
    }
  }
}

export async function updateProfileAction(formData: FormData): Promise<AuthActionResult> {
  try {
    // Validar dados com Zod (regra supabase.mdc)
    const rawData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
    }

    const validatedData = UpdateProfileSchema.parse(rawData)

    // CORREÇÃO: Usar cliente USER (anon) para Auth operations
    const supabaseUser = await createServerSupabaseUser()

    // Obter usuário atual
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    
    if (userError || !user) {
      return {
        success: false,
        error: 'Usuário não autenticado',
      }
    }

    // Atualizar perfil no auth
    const authUpdates: any = {}
    if (validatedData.email && validatedData.email !== user.email) {
      authUpdates.email = validatedData.email
    }

    if (Object.keys(authUpdates).length > 0) {
      const { error: authError } = await supabaseUser.auth.updateUser(authUpdates)
      
      if (authError) {
        return {
          success: false,
          error: formatAuthError(authError.message),
        }
      }
    }

    // Usar Service Client para operações de database
    const supabaseServer = createServerSupabaseClient()
    
    // Atualizar tabela users
    const dbUpdates: any = {
      updated_at: new Date().toISOString(),
    }

    if (validatedData.name) {
      dbUpdates.name = validatedData.name
    }

    if (validatedData.email && validatedData.email !== user.email) {
      dbUpdates.email = validatedData.email
    }

    const { error: dbError } = await supabaseServer
      .from('users')
      .update(dbUpdates)
      .eq('id', user.id)

    if (dbError) {
      console.error('Erro ao atualizar usuário na tabela:', dbError)
      return {
        success: false,
        error: 'Erro ao atualizar perfil',
      }
    }

    revalidatePath('/')
    return {
      success: true,
      message: 'Perfil atualizado com sucesso!',
    }
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
    }
  }
}

function formatAuthError(message: string): string {
  const errorMap: { [key: string]: string } = {
    'Invalid login credentials': 'Email ou senha incorretos',
    'Email not confirmed': 'Verifique seu email antes de fazer login',
    'User not found': 'Usuário não encontrado',
    'Invalid email': 'Email inválido',
    'Password should be at least 6 characters': 'Senha deve ter pelo menos 6 caracteres',
    'Email rate limit exceeded': 'Muitas tentativas. Tente novamente em alguns minutos.',
    'User already registered': 'Este email já está cadastrado',
    'Signup disabled': 'Cadastro temporariamente desabilitado',
  }

  return errorMap[message] || message
} 

// Função de teste para debug
export async function testDirectInsert(): Promise<void> {
  console.log('🔥 TEST: testDirectInsert INICIADA!')
  
  try {
    const supabaseServer = createServerSupabaseClient()
    console.log('🔥 TEST: Cliente criado com sucesso')
    
    const testData = {
      id: '123e4567-e89b-12d3-a456-426614174001',
      email: 'teste-direct@example.com',
      name: 'Teste Direto',
      role: 'user' as const,
    }
    
    console.log('🔥 TEST: Tentando inserir:', testData)
    
    const { data: result, error } = await supabaseServer
      .from('users')
      .insert(testData)
      .select()
    
    console.log('🔥 TEST: Resultado:', { result, error })
    
    if (error) {
      console.error('🔥 TEST: ERRO na inserção:', error)
    } else {
      console.log('🔥 TEST: SUCESSO na inserção!')
    }
    
  } catch (err) {
    console.error('🔥 TEST: ERRO na função:', err)
  }
} 