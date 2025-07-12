import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import * as fs from 'fs/promises';
import * as path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const fileName = 'task_001_v2.txt';
  const filePath = path.resolve('.taskmaster/tasks', fileName);

  // Lê o conteúdo do arquivo
  let content: string;
  try {
    content = await fs.readFile(filePath, 'utf-8');
  } catch (err) {
    console.error('Erro ao ler o arquivo:', err);
    process.exit(1);
  }

  // Extrai o título da linha '# Title:'
  const titleMatch = content.match(/^# Title: (.*)$/m);
  const title = titleMatch ? titleMatch[1].trim() : fileName;

  // Gera o embedding via OpenAI v4+
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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
  } catch (err) {
    console.error('Erro ao gerar embedding:', err);
    process.exit(1);
  }

  // Insere no Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  try {
    const { data, error } = await supabase.from('knowledge_base').insert([
      {
        file_name: fileName,
        title,
        content,
        embedding,
        author_id: '52cda467-d9a0-48cd-9a76-f02641911ff6',
        content_type: 'document',
        is_public: true,
        version: 1,
        tags: [],
        metadata: {},
        created_at: new Date().toISOString(),
      },
    ]);
    if (error) {
      console.error('Erro ao inserir no Supabase:', error);
    } else {
      console.log('Registro inserido com sucesso:', data);
    }
  } catch (err) {
    console.error('Erro inesperado ao inserir no Supabase:', err);
  }
}

main();
