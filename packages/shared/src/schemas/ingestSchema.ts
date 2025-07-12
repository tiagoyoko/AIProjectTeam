import { z } from 'zod';

// Schema para documento individual
export const ingestSchema = z.object({
  content: z.string().min(1, 'Conteúdo obrigatório'),
  title: z.string().min(1, 'Título obrigatório'),
  fileName: z.string().optional(),
  authorId: z.string().uuid('authorId inválido'),
  tags: z.array(z.string()).optional(),
});

// Schema para batch de documentos
export const batchIngestSchema = z.object({
  documents: z.array(ingestSchema).min(1, 'Envie pelo menos um documento'),
});

export type IngestDocument = z.infer<typeof ingestSchema>;
export type BatchIngest = z.infer<typeof batchIngestSchema>;
