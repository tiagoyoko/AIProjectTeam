// Organização dos imports
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import 'dotenv/config';

// Validação das variáveis de ambiente
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas.');
}
if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY não configurada.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

export interface IngestDocumentParams {
  content: string;
  title: string;
  fileName?: string;
  authorId: string;
  tags?: string[];
  contentType?: string;
  isPublic?: boolean;
  version?: number;
  metadata?: Record<string, unknown>;
}

export interface IngestDocumentResult {
  success: boolean;
  data?: unknown;
  error?: string;
  details?: unknown;
}

/**
 * Gera embedding via OpenAI e insere documento na knowledge_base do Supabase.
 * @param params Parâmetros do documento a ser ingerido
 * @returns Resultado da operação
 */
export async function ingestDocument({
  content,
  title,
  fileName,
  authorId,
  tags = [],
  contentType = 'document',
  isPublic = true,
  version = 1,
  metadata = {},
}: IngestDocumentParams): Promise<IngestDocumentResult> {
  // Geração do embedding
  let embedding: number[];
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: content,
    });
    embedding = response.data[0].embedding;
    if (embedding.length !== 1536) {
      throw new Error(
        `Embedding retornado com ${embedding.length} dimensões, esperado 1536.`
      );
    }
  } catch (err: unknown) {
    return {
      success: false,
      error: 'Erro ao gerar embedding',
      details: err instanceof Error ? err.message : err,
    };
  }

  // Inserção no Supabase
  try {
    const { data, error } = await supabase.from('knowledge_base').insert([
      {
        file_name: fileName,
        title,
        content,
        embedding,
        author_id: authorId,
        content_type: contentType,
        is_public: isPublic,
        version,
        tags,
        metadata,
        created_at: new Date().toISOString(),
      },
    ]);
    if (error) {
      return {
        success: false,
        error: 'Erro ao inserir no Supabase',
        details: error,
      };
    }
    return { success: true, data };
  } catch (err: unknown) {
    return {
      success: false,
      error: 'Erro inesperado ao inserir no Supabase',
      details: err instanceof Error ? err.message : err,
    };
  }
}

// Exemplo de uso (comentado)
// (async () => {
//   const result = await ingestDocument({
//     content: 'Texto do documento...',
//     title: 'Título do Documento',
//     fileName: 'exemplo.txt',
//     authorId: '52cda467-d9a0-48cd-9a76-f02641911ff6',
//     tags: ['exemplo', 'teste'],
//   });
//   console.log(result);
// })();
