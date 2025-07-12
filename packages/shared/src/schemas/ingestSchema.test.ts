import { ingestSchema, batchIngestSchema } from './ingestSchema';
import { v4 as uuidv4 } from 'uuid';

describe('ingestSchema (documento individual)', () => {
  it('valida payload real válido', () => {
    const data = {
      content: 'Contrato de prestação de serviços AI',
      title: 'Contrato AI 2024',
      authorId: uuidv4(),
      tags: ['contrato', 'ai', 'jurídico'],
      fileName: 'contrato_ai_2024.txt',
    };
    expect(() => ingestSchema.parse(data)).not.toThrow();
  });

  it('rejeita payload sem campos obrigatórios', () => {
    const data = {
      content: '',
      title: '',
      authorId: '123', // inválido
    };
    const result = ingestSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.errors.map(e => e.message);
      expect(messages).toEqual(
        expect.arrayContaining([
          'Conteúdo obrigatório',
          'Título obrigatório',
          'authorId inválido',
        ])
      );
    }
  });

  it('aceita fileName omitido', () => {
    const data = {
      content: 'Doc sem fileName',
      title: 'Sem fileName',
      authorId: uuidv4(),
    };
    expect(() => ingestSchema.parse(data)).not.toThrow();
  });

  it('aceita tags vazias ou omitidas', () => {
    const data1 = {
      content: 'Doc com tags vazias',
      title: 'Tags vazias',
      authorId: uuidv4(),
      tags: [],
    };
    const data2 = {
      content: 'Doc sem tags',
      title: 'Sem tags',
      authorId: uuidv4(),
    };
    expect(() => ingestSchema.parse(data1)).not.toThrow();
    expect(() => ingestSchema.parse(data2)).not.toThrow();
  });
});

describe('batchIngestSchema (batch de documentos)', () => {
  it('valida batch real com múltiplos documentos válidos', () => {
    const batch = {
      documents: [
        {
          content: 'Doc 1',
          title: 'Primeiro',
          authorId: uuidv4(),
        },
        {
          content: 'Doc 2',
          title: 'Segundo',
          authorId: uuidv4(),
          tags: ['lote'],
        },
      ],
    };
    expect(() => batchIngestSchema.parse(batch)).not.toThrow();
  });

  it('rejeita batch vazio', () => {
    const batch = { documents: [] };
    const result = batchIngestSchema.safeParse(batch);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe(
        'Envie pelo menos um documento'
      );
    }
  });

  it('rejeita batch com documento inválido', () => {
    const batch = {
      documents: [
        {
          content: 'Doc válido',
          title: 'Ok',
          authorId: uuidv4(),
        },
        {
          content: '', // inválido
          title: '', // inválido
          authorId: 'abc', // inválido
        },
      ],
    };
    const result = batchIngestSchema.safeParse(batch);
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.errors.map(e => e.message);
      expect(messages).toEqual(
        expect.arrayContaining([
          'Conteúdo obrigatório',
          'Título obrigatório',
          'authorId inválido',
        ])
      );
    }
  });
});
