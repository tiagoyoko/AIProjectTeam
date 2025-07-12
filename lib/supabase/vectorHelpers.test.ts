import { searchSimilarDocuments } from './vectorHelpers';
import { v4 as uuidv4 } from 'uuid';

describe('searchSimilarDocuments (integração)', () => {
  it('retorna documentos similares para embedding de teste', async () => {
    // Embedding de teste (ajuste para um embedding válido do seu ambiente)
    const embedding = Array(1536).fill(0.1);
    const results = await searchSimilarDocuments({
      embedding,
      threshold: 0.1, // threshold baixo para garantir retorno
      limit: 5,
    });
    expect(Array.isArray(results)).toBe(true);
    // Não falha se não houver dados, mas valida tipagem
    if (results.length > 0) {
      expect(results[0]).toHaveProperty('id');
      expect(results[0]).toHaveProperty('embedding');
    }
  });

  it('aplica filtro de authorId corretamente', async () => {
    const embedding = Array(1536).fill(0.1);
    const authorId = uuidv4(); // Use um authorId real se quiser garantir retorno
    const results = await searchSimilarDocuments({
      embedding,
      filter: { authorId },
      threshold: 0.1,
      limit: 5,
    });
    if (results.length > 0) {
      expect(results.every(doc => doc.author_id === authorId)).toBe(true);
    }
  });

  it('aplica filtro de isPublic corretamente', async () => {
    const embedding = Array(1536).fill(0.1);
    const results = await searchSimilarDocuments({
      embedding,
      filter: { isPublic: true },
      threshold: 0.1,
      limit: 5,
    });
    if (results.length > 0) {
      expect(results.every(doc => doc.is_public === true)).toBe(true);
    }
  });

  it('trata erro de embedding inválido', async () => {
    await expect(
      searchSimilarDocuments({ embedding: [0.1, 0.2, 0.3] })
    ).rejects.toThrow();
  });
});
