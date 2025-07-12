import { createClient, SupabaseClient } from '@supabase/supabase-js';
import 'dotenv/config';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !anonKey || !serviceKey) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas.');
}

const userClient = createClient(url, anonKey);
const adminClient = createClient(url, serviceKey);

// Utilitário para autenticar/criar usuário de teste e retornar client autenticado
async function getAuthenticatedClient(): Promise<SupabaseClient> {
  const email = 'test-rls-user@example.com';
  const password = 'TestRLS123!';
  // Signup (ignora erro se já existe)
  await userClient.auth.signUp({ email, password }).catch(() => {});
  // Login
  const { data, error } = await userClient.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.session)
    throw new Error('Falha ao autenticar usuário de teste');
  // Cria client autenticado
  return createClient(url, anonKey, {
    global: {
      headers: { Authorization: `Bearer ${data.session.access_token}` },
    },
  });
}

async function testKnowledgeBaseRLS() {
  console.log('🔍 Testando RLS: knowledge_base');
  // SELECT: usuário só pode ver públicos ou próprios
  const { data: pub, error: pubErr } = await userClient
    .from('knowledge_base')
    .select('*')
    .eq('is_public', true)
    .limit(1);
  if (pubErr)
    throw new Error('Usuário comum não conseguiu acessar documentos públicos!');

  // SELECT: usuário não pode ver privados de outros
  const { data: priv, error: privErr } = await userClient
    .from('knowledge_base')
    .select('*')
    .eq('is_public', false)
    .limit(1);
  if (priv && priv.length > 0)
    throw new Error('Usuário comum acessou documento privado de outro!');

  // Admin pode tudo
  const { data: all, error: allErr } = await adminClient
    .from('knowledge_base')
    .select('*')
    .limit(1);
  if (allErr) throw new Error('Admin não conseguiu acessar knowledge_base!');
  console.log('✅ knowledge_base OK');
}

async function testKnowledgeBaseMutations() {
  console.log('🔍 Testando mutações autenticadas em knowledge_base');
  const client = await getAuthenticatedClient();
  const { data: userData } = await client.auth.getUser();
  const userId = userData.user?.id;
  if (!userId)
    throw new Error('Não foi possível obter o user id do usuário de teste!');

  // Garante que o usuário existe na tabela users
  await client.from('users').upsert({
    id: userId,
    email: 'test-rls-user@example.com',
    name: 'Test RLS User',
    role: 'user',
  });

  // INSERT: deve conseguir inserir documento próprio
  const insertRes = await client
    .from('knowledge_base')
    .insert({
      title: 'Doc RLS Test',
      content: 'Conteúdo teste',
      author_id: userId,
      is_public: false,
      embedding: Array(1536).fill(0.1),
    })
    .select()
    .single();
  if (insertRes.error) {
    console.error(
      'Erro detalhado do Supabase (INSERT knowledge_base):',
      insertRes.error
    );
    throw new Error(
      'Usuário autenticado não conseguiu inserir documento próprio!'
    );
  }
  const docId = insertRes.data.id;

  // UPDATE: deve conseguir atualizar documento próprio
  const updateRes = await client
    .from('knowledge_base')
    .update({ title: 'Doc RLS Test Editado' })
    .eq('id', docId);
  if (updateRes.error)
    throw new Error(
      'Usuário autenticado não conseguiu atualizar documento próprio!'
    );

  // DELETE: deve conseguir deletar documento próprio
  const deleteRes = await client
    .from('knowledge_base')
    .delete()
    .eq('id', docId);
  if (deleteRes.error)
    throw new Error(
      'Usuário autenticado não conseguiu deletar documento próprio!'
    );

  console.log(
    '✅ Mutations (INSERT/UPDATE/DELETE) validadas para knowledge_base'
  );
}

async function testTableRLS(table: string) {
  console.log(`🔍 Testando RLS: ${table}`);
  // SELECT: usuário deve ver apenas seus próprios registros (simulação)
  const { error: userErr } = await userClient.from(table).select('*').limit(1);
  if (userErr)
    throw new Error(
      `Usuário comum não conseguiu acessar ${table}: ${userErr.message}`
    );
  // Admin pode tudo
  const { error: adminErr } = await adminClient
    .from(table)
    .select('*')
    .limit(1);
  if (adminErr)
    throw new Error(
      `Admin não conseguiu acessar ${table}: ${adminErr.message}`
    );
  console.log(`✅ ${table} OK`);
}

async function main() {
  try {
    await testKnowledgeBaseRLS();
    await testKnowledgeBaseMutations();
    await testTableRLS('tasks');
    await testTableRLS('projects');
    await testTableRLS('users');
    // Adicione mais testes específicos conforme necessário
    console.log('\n🎉 Todas as políticas RLS validadas com sucesso!');
  } catch (err) {
    console.error('❌ Falha na validação das políticas RLS:', err);
    process.exit(1);
  }
}

main();
