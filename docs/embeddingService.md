# Serviço de Ingestão de Embeddings (embeddingService)

Este serviço permite gerar embeddings de textos e armazenar no Supabase Vector Store, pronto para uso em APIs, server actions e jobs.

## Como usar

```typescript
import { ingestDocument } from '@/services/embeddingService';

const result = await ingestDocument({
  content: 'Texto do documento...',
  title: 'Título do Documento',
  fileName: 'exemplo.txt',
  authorId: 'uuid-do-autor',
  tags: ['exemplo', 'teste'],
});
```

## Parâmetros

- `content` (string, obrigatório): Texto a ser embedado
- `title` (string, obrigatório): Título do documento
- `fileName` (string, opcional): Nome do arquivo
- `authorId` (uuid, obrigatório): ID do autor (deve existir na tabela users)
- `tags` (string[], opcional): Tags para organização
- `contentType` (string, opcional): Tipo do conteúdo (default: 'document')
- `isPublic` (boolean, opcional): Se o documento é público (default: true)
- `version` (number, opcional): Versão do documento (default: 1)
- `metadata` (objeto, opcional): Metadados extras

## Fluxo

1. Recebe os dados do documento
2. Gera embedding via OpenAI
3. Insere no Supabase na tabela knowledge_base
4. Retorna status de sucesso ou erro

## Exemplo de resposta

```json
{
  "success": true,
  "data": {
    "id": "uuid-gerado",
    "title": "Título do Documento",
    ...
  }
}
```

## Requisitos

- Variáveis de ambiente:
  - `OPENAI_API_KEY`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Usuário válido na tabela users (authorId)

## Dicas de produção

- Use autenticação JWT para proteger a API
- Implemente rate limiting para evitar abuso
- Para ingestão em lote, utilize filas e workers
- Monitore logs e erros para garantir robustez

## Referências

- [OpenAI Embeddings API](https://platform.openai.com/docs/guides/embeddings)
- [Supabase Vector Store](https://supabase.com/docs/guides/database/extensions/pgvector)
