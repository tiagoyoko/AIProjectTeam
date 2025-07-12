import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

// Inicialização do client (apenas para uso em testes/utilitários compartilhados)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export interface VectorSearchParams {
  embedding: number[];
  threshold?: number;
  limit?: number;
  filter?: {
    authorId?: string;
    isPublic?: boolean;
    tags?: string[];
  };
}

export type KnowledgeBaseRow =
  Database['public']['Tables']['knowledge_base']['Row'];

/**
 * Busca documentos similares no knowledge_base usando busca vetorial (pgvector)
 * @param params embedding, threshold, limit, filtros opcionais
 * @returns array de documentos similares
 */
export async function searchSimilarDocuments({
  embedding,
  threshold = 0.8,
  limit = 10,
  filter = {},
}: VectorSearchParams): Promise<KnowledgeBaseRow[]> {
  const { data, error } = await supabase.rpc('match_knowledge_base', {
    query_embedding: embedding,
    match_threshold: threshold,
    match_count: limit,
  });
  if (error) {
    throw new Error(`Erro na busca vetorial: ${error.message}`);
  }
  let results = data as KnowledgeBaseRow[];
  if (filter.authorId) {
    results = results.filter(doc => doc.author_id === filter.authorId);
  }
  if (filter.isPublic !== undefined) {
    results = results.filter(doc => doc.is_public === filter.isPublic);
  }
  if (filter.tags && filter.tags.length > 0) {
    results = results.filter(
      doc =>
        Array.isArray(doc.tags) &&
        filter.tags!.every(tag => doc.tags!.includes(tag))
    );
  }
  return results;
}
