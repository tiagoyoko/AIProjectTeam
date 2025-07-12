import { NextResponse } from 'next/server'
import { testDirectInsert } from '../../actions/auth'

export async function GET() {
  console.log('🔥 API: /api/test-insert chamada')
  
  try {
    await testDirectInsert()
    return NextResponse.json({ success: true, message: 'Teste executado - veja os logs' })
  } catch (error) {
    console.error('🔥 API: Erro no teste:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }, { status: 500 })
  }
} 