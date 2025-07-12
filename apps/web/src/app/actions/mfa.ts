'use server'

import { 
  MFAEnrollSchema, 
  MFAVerifySchema, 
  MFAChallengeSchema 
} from '@aiprojectteam/shared'
import type { 
  MFAEnroll, 
  MFAVerify, 
  MFAChallenge 
} from '@aiprojectteam/shared'
import { createServerSupabaseClient } from '@/lib/supabase/server'

interface MFAActionResult {
  success: boolean
  error?: string
  message?: string
  data?: any
}

export async function enrollMFAAction(formData: FormData): Promise<MFAActionResult> {
  try {
    const rawData = {
      factorType: formData.get('factorType') as string,
      issuer: formData.get('issuer') as string,
    }

    const validatedData = MFAEnrollSchema.parse(rawData)

    const supabaseServer = createServerSupabaseClient()

    // Verificar se o usuário está autenticado
    const { data: { user }, error: userError } = await supabaseServer.auth.getUser()
    
    if (userError || !user) {
      return {
        success: false,
        error: 'Usuário não autenticado',
      }
    }

    // Enrollar MFA (API do Supabase só suporta factorType)
    const { data, error } = await supabaseServer.auth.mfa.enroll({
      factorType: 'totp',
    })

    if (error) {
      return {
        success: false,
        error: formatMFAError(error.message),
      }
    }

    return {
      success: true,
      message: 'MFA configurado com sucesso!',
      data: {
        qr_code: data.totp.qr_code,
        secret: data.totp.secret,
        uri: data.totp.uri,
      },
    }
  } catch (error) {
    console.error('Erro no enroll MFA:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
    }
  }
}

export async function verifyMFAAction(formData: FormData): Promise<MFAActionResult> {
  try {
    const rawData = {
      factorId: formData.get('factorId') as string,
      code: formData.get('code') as string,
    }

    const validatedData = MFAVerifySchema.parse(rawData)

    const supabaseServer = createServerSupabaseClient()

    // Verificar se o usuário está autenticado
    const { data: { user }, error: userError } = await supabaseServer.auth.getUser()
    
    if (userError || !user) {
      return {
        success: false,
        error: 'Usuário não autenticado',
      }
    }

    // Verificar código MFA
    const { data, error } = await supabaseServer.auth.mfa.verify({
      factorId: validatedData.factorId,
      challengeId: validatedData.factorId, // Para TOTP, challengeId é o mesmo que factorId
      code: validatedData.code,
    })

    if (error) {
      return {
        success: false,
        error: formatMFAError(error.message),
      }
    }

    return {
      success: true,
      message: 'MFA verificado com sucesso!',
      data: data,
    }
  } catch (error) {
    console.error('Erro na verificação MFA:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
    }
  }
}

export async function challengeMFAAction(formData: FormData): Promise<MFAActionResult> {
  try {
    const rawData = {
      factorId: formData.get('factorId') as string,
    }

    const validatedData = MFAChallengeSchema.parse(rawData)

    const supabaseServer = createServerSupabaseClient()

    // Verificar se o usuário está autenticado
    const { data: { user }, error: userError } = await supabaseServer.auth.getUser()
    
    if (userError || !user) {
      return {
        success: false,
        error: 'Usuário não autenticado',
      }
    }

    // Criar challenge MFA
    const { data, error } = await supabaseServer.auth.mfa.challenge({
      factorId: validatedData.factorId,
    })

    if (error) {
      return {
        success: false,
        error: formatMFAError(error.message),
      }
    }

    return {
      success: true,
      message: 'Challenge MFA criado com sucesso!',
      data: data,
    }
  } catch (error) {
    console.error('Erro no challenge MFA:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
    }
  }
}

export async function unenrollMFAAction(formData: FormData): Promise<MFAActionResult> {
  try {
    const factorId = formData.get('factorId') as string

    if (!factorId) {
      return {
        success: false,
        error: 'Factor ID é obrigatório',
      }
    }

    const supabaseServer = createServerSupabaseClient()

    // Verificar se o usuário está autenticado
    const { data: { user }, error: userError } = await supabaseServer.auth.getUser()
    
    if (userError || !user) {
      return {
        success: false,
        error: 'Usuário não autenticado',
      }
    }

    // Remover fator MFA
    const { data, error } = await supabaseServer.auth.mfa.unenroll({
      factorId: factorId,
    })

    if (error) {
      return {
        success: false,
        error: formatMFAError(error.message),
      }
    }

    return {
      success: true,
      message: 'MFA removido com sucesso!',
      data: data,
    }
  } catch (error) {
    console.error('Erro ao remover MFA:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
    }
  }
}

export async function listMFAFactorsAction(): Promise<MFAActionResult> {
  try {
    const supabaseServer = createServerSupabaseClient()

    // Verificar se o usuário está autenticado
    const { data: { user }, error: userError } = await supabaseServer.auth.getUser()
    
    if (userError || !user) {
      return {
        success: false,
        error: 'Usuário não autenticado',
      }
    }

    // Listar fatores MFA
    const { data, error } = await supabaseServer.auth.mfa.listFactors()

    if (error) {
      return {
        success: false,
        error: formatMFAError(error.message),
      }
    }

    return {
      success: true,
      data: data,
    }
  } catch (error) {
    console.error('Erro ao listar fatores MFA:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor',
    }
  }
}

function formatMFAError(message: string): string {
  const errorMap: { [key: string]: string } = {
    'Factor already exists': 'MFA já está configurado para este usuário',
    'Invalid verification code': 'Código de verificação inválido',
    'Verification code expired': 'Código de verificação expirado',
    'Factor not found': 'Fator MFA não encontrado',
    'MFA enrollment failed': 'Falha ao configurar MFA',
    'Too many MFA enrollment attempts': 'Muitas tentativas de configuração MFA',
    'Invalid factor type': 'Tipo de fator MFA inválido',
  }

  return errorMap[message] || message
} 