import { NextRequest, NextResponse } from 'next/server';
import { ingestDocument } from '@/services/embeddingService';
import { z } from 'zod';

// Schema de validação para cada documento
const ingestSchema = z.object({
  content: z.string().min(1, 'Conteúdo obrigatório'),
  title: z.string().min(1, 'Título obrigatório'),
  fileName: z.string().optional(),
  authorId: z.string().uuid('authorId inválido'),
  tags: z.array(z.string()).optional(),
});

const batchSchema = z.object({
  documents: z.array(ingestSchema).min(1, 'Envie pelo menos um documento'),
});

/**
 * Endpoint para ingestão em lote de documentos vetoriais
 */
export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const parsed = batchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validação falhou',
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }
    const { documents } = parsed.data;
    // Validação e ingestão em paralelo
    const results = await Promise.all(
      documents.map(async (doc, idx) => {
        const result = await ingestDocument(doc);
        return { index: idx, ...result };
      })
    );
    return NextResponse.json({ success: true, results });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: 'Erro inesperado',
        details: err instanceof Error ? err.message : err,
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
