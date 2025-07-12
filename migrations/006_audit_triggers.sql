-- =============================================
-- Auditoria: Triggers para INSERT e DELETE em tasks
-- =============================================

-- Função para logar INSERT em tasks
CREATE OR REPLACE FUNCTION log_task_insert()
RETURNS trigger AS $$
BEGIN
  INSERT INTO audit_logs (table_name, operation, record_id, old_data, new_data, changed_by)
  VALUES (
    'tasks',
    TG_OP,
    NEW.id,
    NULL,
    row_to_json(NEW),
    auth.uid()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_task_insert ON tasks;
CREATE TRIGGER trg_log_task_insert
AFTER INSERT ON tasks
FOR EACH ROW
EXECUTE FUNCTION log_task_insert();

-- Função para logar DELETE em tasks
CREATE OR REPLACE FUNCTION log_task_delete()
RETURNS trigger AS $$
BEGIN
  INSERT INTO audit_logs (table_name, operation, record_id, old_data, new_data, changed_by)
  VALUES (
    'tasks',
    TG_OP,
    OLD.id,
    row_to_json(OLD),
    NULL,
    auth.uid()
  );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_task_delete ON tasks;
CREATE TRIGGER trg_log_task_delete
AFTER DELETE ON tasks
FOR EACH ROW
EXECUTE FUNCTION log_task_delete(); 