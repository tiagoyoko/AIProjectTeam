import { supabase } from './client';
import { Database } from '@aiprojectteam/shared';

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
  // Chama função SQL match_knowledge_base definida no Supabase
  const { data, error } = await supabase.rpc('match_knowledge_base', {
    query_embedding: embedding,
    match_threshold: threshold,
    match_count: limit,
  });
  if (error) {
    throw new Error(`Erro na busca vetorial: ${error.message}`);
  }
  let results = data as KnowledgeBaseRow[];
  // Filtros opcionais em memória (caso necessário)
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
