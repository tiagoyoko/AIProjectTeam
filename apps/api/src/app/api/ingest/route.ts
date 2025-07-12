import { NextRequest, NextResponse } from 'next/server';
import { ingestDocument } from '@/services/embeddingService';
import { z } from 'zod';

// Schema de validação com Zod
type IngestBody = {
  content: string;
  title: string;
  fileName?: string;
  authorId: string;
  tags?: string[];
};

const ingestSchema = z.object({
  content: z.string().min(1, 'Conteúdo obrigatório'),
  title: z.string().min(1, 'Título obrigatório'),
  fileName: z.string().optional(),
  authorId: z.string().uuid('authorId inválido'),
  tags: z.array(z.string()).optional(),
});

/**
 * Endpoint para ingestão individual de documento vetorial
 */
export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const parsed = ingestSchema.safeParse(body);
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
    const { content, title, fileName, authorId, tags } = parsed.data;
    const result = await ingestDocument({
      content,
      title,
      fileName,
      authorId,
      tags,
    });
    if (result.success) {
      return NextResponse.json({ success: true, data: result.data });
    } else {
      return NextResponse.json(
        { success: false, error: result.error, details: result.details },
        { status: 500 }
      );
    }
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
