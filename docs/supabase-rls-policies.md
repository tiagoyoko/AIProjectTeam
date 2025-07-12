# Políticas Row-Level Security (RLS) — Supabase

## Visão Geral

Este guia documenta as políticas RLS aplicadas ao projeto, com SQL pronto para rodar, explicações e exemplos de teste para as principais tabelas: `knowledge_base`, `tasks`, `projects` e `users`.

---

## 1. Tabela: knowledge_base

```sql
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

-- SELECT: Usuário pode ver documentos públicos ou próprios
CREATE POLICY "Users can access their own or public knowledge" ON knowledge_base
FOR SELECT USING (
  is_public = true OR auth.uid() = author_id
);

-- INSERT: Só pode inserir documentos próprios
CREATE POLICY "Users can insert their own knowledge" ON knowledge_base
FOR INSERT WITH CHECK (
  auth.uid() = author_id
);

-- UPDATE: Só pode atualizar documentos próprios
CREATE POLICY "Users can update their own knowledge" ON knowledge_base
FOR UPDATE USING (
  auth.uid() = author_id
);

-- DELETE: Só pode deletar documentos próprios
CREATE POLICY "Users can delete their own knowledge" ON knowledge_base
FOR DELETE USING (
  auth.uid() = author_id
);
```

---

## 2. Tabela: tasks

```sql
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- SELECT: Usuário pode ver tasks de projetos que participa ou atribuídas a si
CREATE POLICY "Users can view tasks of their projects or assigned" ON tasks
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = tasks.project_id
      AND (projects.owner_id = auth.uid() OR auth.uid() = ANY(projects.team_members))
  )
  OR tasks.assignee_id = auth.uid()
);

-- INSERT: Só pode inserir tasks em projetos que participa
CREATE POLICY "Users can insert tasks in their projects" ON tasks
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = tasks.project_id
      AND (projects.owner_id = auth.uid() OR auth.uid() = ANY(projects.team_members))
  )
);

-- UPDATE: Só pode atualizar tasks atribuídas a si ou em projetos próprios
CREATE POLICY "Users can update their assigned or owned tasks" ON tasks
FOR UPDATE USING (
  tasks.assignee_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = tasks.project_id
      AND projects.owner_id = auth.uid()
  )
);

-- DELETE: Só pode deletar tasks atribuídas a si ou em projetos próprios
CREATE POLICY "Users can delete their assigned or owned tasks" ON tasks
FOR DELETE USING (
  tasks.assignee_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = tasks.project_id
      AND projects.owner_id = auth.uid()
  )
);
```

---

## 3. Tabela: projects

```sql
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- SELECT: Só pode ver projetos que participa
CREATE POLICY "Users can view their projects" ON projects
FOR SELECT USING (
  owner_id = auth.uid() OR auth.uid() = ANY(team_members)
);

-- INSERT: Só pode criar projetos para si
CREATE POLICY "Users can insert their own projects" ON projects
FOR INSERT WITH CHECK (
  owner_id = auth.uid()
);

-- UPDATE: Só pode alterar projetos que é owner
CREATE POLICY "Users can update their own projects" ON projects
FOR UPDATE USING (
  owner_id = auth.uid()
);

-- DELETE: Só pode deletar projetos que é owner
CREATE POLICY "Users can delete their own projects" ON projects
FOR DELETE USING (
  owner_id = auth.uid()
);
```

---

## 4. Tabela: users

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- SELECT: Só pode ver o próprio perfil
CREATE POLICY "Users can view their own profile" ON users
FOR SELECT USING (
  id = auth.uid()
);

-- UPDATE: Só pode atualizar o próprio perfil
CREATE POLICY "Users can update their own profile" ON users
FOR UPDATE USING (
  id = auth.uid()
);
```

---

## Exemplos de Teste de Acesso

### SQL (Supabase SQL Editor)

```sql
-- Como usuário A (id = 'uuidA')
SELECT * FROM tasks WHERE assignee_id = 'uuidA' OR project_id IN (
  SELECT id FROM projects WHERE owner_id = 'uuidA' OR 'uuidA' = ANY(team_members)
);

-- Tentar atualizar task de outro usuário (deve falhar)
UPDATE tasks SET title = 'Hack' WHERE id = 'task_de_outra_pessoa';
```

### TypeScript (Supabase Client)

```typescript
import { supabase } from '@/lib/supabase/client';

const { data, error } = await supabase.from('tasks').select('*');
if (error) {
  // Se não autorizado, error.message terá info de RLS
}
```

---

## Troubleshooting e Dicas

- Sempre teste com diferentes usuários (use Supabase Auth para simular)
- Use o painel Supabase para visualizar políticas aplicadas
- Documente as políticas no README/docs do projeto
- Para debug, ative logs de RLS no Supabase
- Revise as políticas após mudanças no schema ou regras de negócio

---

## 5. Testes Automatizados de RLS no CI

Para garantir que as políticas RLS estejam sempre corretas e seguras, o projeto conta com um script automatizado de validação:

**Arquivo:** `tools/scripts/test-rls-policies.ts`

### O que o script valida

- SELECT, INSERT, UPDATE e DELETE autenticados na tabela `knowledge_base`
- Acesso controlado em `tasks`, `projects` e `users`
- Criação automática de usuário de teste na tabela `users`
- Diagnóstico detalhado em caso de falha

### Como rodar localmente

```bash
pnpm test:rls
```

### Como rodar no CI

Adicione o step no seu workflow:

```yaml
- name: Testar políticas RLS do Supabase
  run: pnpm test:rls
  env:
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
    NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
    SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

### Benefícios

- Detecta regressões de permissão automaticamente
- Garante segurança contínua em ambientes colaborativos
- Facilita troubleshooting e onboarding

---
