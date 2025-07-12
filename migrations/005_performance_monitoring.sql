-- =============================================
-- Performance & Monitoring: Índices, Auditoria, Triggers, Monitoramento
-- =============================================

-- 1. Índices para performance

-- Índice para busca rápida por email de usuário
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Índice para tasks por projeto
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks (project_id);

-- Índice para busca por author_id em knowledge_base
CREATE INDEX IF NOT EXISTS idx_knowledge_base_author_id ON knowledge_base (author_id);

-- Índice para busca por tags (array ou jsonb)
CREATE INDEX IF NOT EXISTS idx_knowledge_base_tags ON knowledge_base USING GIN (tags);

-- 2. Tabela de auditoria

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  operation text NOT NULL,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  changed_at timestamptz DEFAULT now(),
  changed_by uuid
);

-- 3. Função e trigger para log de UPDATE em tasks

CREATE OR REPLACE FUNCTION log_task_update()
RETURNS trigger AS $$
BEGIN
  INSERT INTO audit_logs (table_name, operation, record_id, old_data, new_data, changed_by)
  VALUES (
    'tasks',
    TG_OP,
    NEW.id,
    row_to_json(OLD),
    row_to_json(NEW),
    auth.uid()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_task_update ON tasks;
CREATE TRIGGER trg_log_task_update
AFTER UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION log_task_update();

-- 4. Habilitar extensão de monitoramento de queries
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- 5. (Opcional) Adapte triggers para INSERT/DELETE e outras tabelas conforme necessário
-- Exemplo para INSERT em tasks:
-- CREATE OR REPLACE FUNCTION log_task_insert() ...
-- CREATE TRIGGER trg_log_task_insert ... 