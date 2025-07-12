# Supabase Setup - AI Project Team

## Configuração Inicial

Este guia explica como configurar o banco de dados Supabase para o AI Project Team.

## 📋 Pré-requisitos

- Conta no [Supabase](https://supabase.com)
- Node.js 18+ instalado
- CLI do Supabase (opcional, mas recomendado)

## 🚀 1. Criar Projeto Supabase

### 1.1 Via Dashboard Web

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Crie uma nova organização ou use existente
4. Clique em "New Project"
5. Configure:
   - **Name**: `ai-project-team`
   - **Database Password**: Use um password forte
   - **Region**: Escolha a região mais próxima (ex: South America)
   - **Pricing Plan**: Free tier para desenvolvimento

### 1.2 Obter Credenciais

Após criar o projeto:

1. Vá para **Settings > API**
2. Copie as seguintes informações:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public key**: `eyJ...`
   - **service_role key**: `eyJ...` ⚠️ **NUNCA exponha no frontend**

## 🔧 2. Configurar Variáveis de Ambiente

Crie o arquivo `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## 🗃️ 3. Executar Migrations

### 3.1 Via SQL Editor (Recomendado)

1. Acesse **SQL Editor** no dashboard
2. Execute os arquivos na ordem:

```sql
-- 1. Executar migrations/001_create_enums.sql
-- Crie um novo query e cole o conteúdo do arquivo

-- 2. Executar migrations/002_create_tables.sql
-- Crie um novo query e cole o conteúdo do arquivo

-- 3. Executar migrations/003_create_indexes.sql
-- Crie um novo query e cole o conteúdo do arquivo

-- 4. Executar migrations/004_create_functions.sql
-- Crie um novo query e cole o conteúdo do arquivo
```

### 3.2 Via CLI Supabase (Opcional)

```bash
# Instalar CLI
npm install -g supabase

# Login
supabase login

# Inicializar projeto local
supabase init

# Executar migrations
supabase db push
```

## 🔐 4. Configurar Autenticação

### 4.1 Habilitar Provedores

1. Vá para **Authentication > Providers**
2. Habilite:
   - ✅ **Email** (obrigatório)
   - ✅ **Google** (opcional)
   - ✅ **GitHub** (opcional)

### 4.2 Configurar Email Templates

1. Vá para **Authentication > Email Templates**
2. Personalize:
   - **Confirm signup**
   - **Reset password**
   - **Magic link**

### 4.3 Configurar MFA

1. Vá para **Authentication > Settings**
2. Habilite **Multi-Factor Authentication**
3. Configure **TOTP** como método obrigatório

## 🛡️ 5. Configurar Row-Level Security (RLS)

### 5.1 Habilitar RLS

Execute no SQL Editor:

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
```

### 5.2 Criar Políticas de Segurança

```sql
-- Política para usuários (podem ver/editar próprios dados)
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Política para projetos (owner e team members)
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (
    auth.uid() = owner_id OR
    auth.uid() = ANY(team_members)
  );

CREATE POLICY "Project owners can manage projects" ON projects
  FOR ALL USING (auth.uid() = owner_id);

-- Política para tasks (baseada no projeto)
CREATE POLICY "Users can view project tasks" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = tasks.project_id
      AND (projects.owner_id = auth.uid() OR auth.uid() = ANY(projects.team_members))
    )
  );

-- Política para knowledge base (público + próprio conteúdo)
CREATE POLICY "Users can view public knowledge" ON knowledge_base
  FOR SELECT USING (is_public = true OR author_id = auth.uid());

CREATE POLICY "Authors can manage own content" ON knowledge_base
  FOR ALL USING (author_id = auth.uid());
```

## 📊 6. Configurar Vector Database

### 6.1 Habilitar Extensão pgvector

Execute no SQL Editor:

```sql
-- Já incluído no migration 002, mas confirme:
CREATE EXTENSION IF NOT EXISTS vector;
```

### 6.2 Testar Busca Semântica

```sql
-- Inserir dados de teste
INSERT INTO knowledge_base (title, content, author_id, embedding) VALUES
('Teste', 'Conteúdo de teste para busca semântica',
 '00000000-0000-0000-0000-000000000000',
 '[0.1, 0.2, 0.3]'::vector);

-- Testar função de busca
SELECT * FROM match_knowledge_base('[0.1, 0.2, 0.3]'::vector, 0.5, 5);
```

## 🔍 7. Monitoramento e Logs

### 7.1 Configurar Logs

1. Vá para **Logs > Database**
2. Configure alertas para:
   - Queries lentas (> 1s)
   - Erros de conexão
   - Uso de CPU alto

### 7.2 Métricas Importantes

Monitor regularmente:

- **Database size**: Limite do plano
- **API requests**: Rate limits
- **Concurrent connections**: Performance
- **Query performance**: Otimização

## 🚨 8. Backup e Recovery

### 8.1 Backup Automático

- **Free tier**: 7 dias de backup automático
- **Pro tier**: 30 dias + backup sob demanda

### 8.2 Backup Manual

```bash
# Via CLI
supabase db dump --data-only > backup.sql

# Restaurar
supabase db reset
psql -f backup.sql
```

## ✅ 9. Validação da Configuração

### 9.1 Teste de Conexão

Execute no projeto:

```bash
pnpm type-check  # Verificar tipos
pnpm build       # Verificar build
```

### 9.2 Teste das Funcionalidades

1. **Autenticação**: Signup/Login
2. **RLS**: Acesso a dados
3. **Vector Search**: Busca semântica
4. **Audit Logs**: Registro de mudanças

## 🔧 10. Troubleshooting

### Problemas Comuns

**❌ Erro: "Invalid API key"**

- Verifique se as keys estão corretas no `.env.local`
- Confirme que está usando `NEXT_PUBLIC_` para keys públicas

**❌ Erro: "Row Level Security violation"**

- Verifique se as políticas RLS estão configuradas
- Confirme que o usuário está autenticado

**❌ Erro: "Function does not exist"**

- Execute todas as migrations na ordem correta
- Verifique se as extensões estão habilitadas

**❌ Performance lenta**

- Verifique se os índices foram criados
- Analise queries com `EXPLAIN ANALYZE`
- Configure connection pooling

## 📚 Recursos Adicionais

- [Documentação Supabase](https://supabase.com/docs)
- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## ⚠️ IMPORTANTE: Uso Correto dos Clientes Supabase

### Regras Fundamentais:

**1. Para Operações de Auth (signUp, signIn, etc.):**

- ✅ Use `createServerSupabaseUser()` (anon key)
- ❌ NÃO use `createServerSupabaseClient()` (service key)

**2. Para Operações de Database (CRUD nas tabelas):**

- ✅ Use `createServerSupabaseClient()` (service key)
- ⚠️ Pode usar `createServerSupabaseUser()` com RLS habilitado

### Exemplo Correto:

```typescript
export async function signUpAction(formData: FormData) {
  // ✅ CORRETO: Auth operations com anon key
  const supabaseUser = await createServerSupabaseUser()
  const { data, error } = await supabaseUser.auth.signUp({ ... })

  if (data.user) {
    // ✅ CORRETO: DB operations com service key
    const supabaseServer = createServerSupabaseClient()
    await supabaseServer.from('users').insert({ ... })
  }
}
```

### Por quê?

- **Service Key**: Bypassa RLS e tem acesso total. Auth APIs requerem anon key.
- **Anon Key**: Para autenticação e operações com RLS habilitado.

---

**✅ Setup Completo!** Seu banco Supabase está pronto para o AI Project Team.

## 🔍 Busca Vetorial com Helper TypeScript

Para realizar buscas semânticas/vetoriais na knowledge_base usando o Supabase e pgvector, utilize o helper centralizado:

**Arquivo:** `packages/shared/src/supabase/vectorHelpers.ts`

### Exemplo de uso

```typescript
import { searchSimilarDocuments } from '@aiprojectteam/shared/src/supabase/vectorHelpers';

async function buscarDocumentos() {
  // Embedding de consulta (deve ter 1536 dimensões)
  const embedding = Array(1536).fill(0.1);
  // Busca documentos similares
  const docs = await searchSimilarDocuments({
    embedding,
    threshold: 0.8, // Similaridade mínima (0 a 1)
    limit: 5, // Máximo de resultados
    filter: {
      authorId: 'uuid-do-autor', // Opcional
      isPublic: true, // Opcional
      tags: ['contrato', 'ai'], // Opcional
    },
  });
  console.log(docs);
}
```

### Parâmetros

- `embedding`: vetor de números (float[], 1536 dimensões)
- `threshold`: similaridade mínima (padrão: 0.8)
- `limit`: máximo de resultados (padrão: 10)
- `filter`: objeto opcional com:
  - `authorId`: filtra por autor
  - `isPublic`: filtra por visibilidade
  - `tags`: filtra por tags (todas devem estar presentes)

### Retorno

Array de objetos do tipo `KnowledgeBaseRow` (tipado pelo schema do banco), contendo os campos da tabela `knowledge_base`.

### Observações

- O helper utiliza a função SQL `match_knowledge_base` definida no Supabase.
- Filtros adicionais são aplicados em memória após a busca.
- Em caso de erro (ex: embedding inválido), uma exceção é lançada.
