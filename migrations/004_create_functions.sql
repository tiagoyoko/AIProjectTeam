-- ===== VECTOR SEARCH FUNCTIONS =====

-- Function for semantic search in knowledge base
CREATE OR REPLACE FUNCTION match_knowledge_base(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kb.id,
    kb.title,
    kb.content,
    (kb.embedding <=> query_embedding) * -1 + 1 AS similarity
  FROM knowledge_base kb
  WHERE kb.embedding <=> query_embedding < 1 - match_threshold
    AND kb.is_public = true
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to update search vector when content changes
CREATE OR REPLACE FUNCTION update_knowledge_base_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('portuguese', COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.content, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update search vector
CREATE TRIGGER update_knowledge_base_search_vector_trigger
  BEFORE INSERT OR UPDATE ON knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION update_knowledge_base_search_vector();

-- ===== AUDIT FUNCTIONS =====

-- Create audit log table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create audit log index
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_record_id ON audit_logs(record_id);
CREATE INDEX idx_audit_logs_operation ON audit_logs(operation);
CREATE INDEX idx_audit_logs_changed_at ON audit_logs(changed_at);
CREATE INDEX idx_audit_logs_changed_by ON audit_logs(changed_by);

-- Generic audit function
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Try to get current user from session
  current_user_id := COALESCE(
    auth.uid(),
    (current_setting('app.current_user_id', true))::uuid
  );

  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (
      table_name,
      record_id,
      operation,
      old_data,
      changed_by
    ) VALUES (
      TG_TABLE_NAME,
      OLD.id,
      TG_OP,
      to_jsonb(OLD),
      current_user_id
    );
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (
      table_name,
      record_id,
      operation,
      old_data,
      new_data,
      changed_by
    ) VALUES (
      TG_TABLE_NAME,
      NEW.id,
      TG_OP,
      to_jsonb(OLD),
      to_jsonb(NEW),
      current_user_id
    );
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (
      table_name,
      record_id,
      operation,
      new_data,
      changed_by
    ) VALUES (
      TG_TABLE_NAME,
      NEW.id,
      TG_OP,
      to_jsonb(NEW),
      current_user_id
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to important tables
CREATE TRIGGER audit_users_trigger
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_projects_trigger
  AFTER INSERT OR UPDATE OR DELETE ON projects
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_tasks_trigger
  AFTER INSERT OR UPDATE OR DELETE ON tasks
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_agents_trigger
  AFTER INSERT OR UPDATE OR DELETE ON agents
  FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- ===== UTILITY FUNCTIONS =====

-- Function to get project statistics
CREATE OR REPLACE FUNCTION get_project_stats(project_uuid UUID)
RETURNS TABLE (
  total_tasks INTEGER,
  completed_tasks INTEGER,
  in_progress_tasks INTEGER,
  blocked_tasks INTEGER,
  progress_percentage DECIMAL
)
LANGUAGE plpgsql
AS $$
DECLARE
  total_count INTEGER;
  completed_count INTEGER;
  in_progress_count INTEGER;
  blocked_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_count
  FROM tasks WHERE project_id = project_uuid;
  
  SELECT COUNT(*) INTO completed_count
  FROM tasks WHERE project_id = project_uuid AND status = 'done';
  
  SELECT COUNT(*) INTO in_progress_count
  FROM tasks WHERE project_id = project_uuid AND status = 'in_progress';
  
  SELECT COUNT(*) INTO blocked_count
  FROM tasks WHERE project_id = project_uuid AND status = 'blocked';
  
  RETURN QUERY SELECT 
    total_count,
    completed_count,
    in_progress_count,
    blocked_count,
    CASE 
      WHEN total_count = 0 THEN 0::DECIMAL
      ELSE ROUND((completed_count::DECIMAL / total_count::DECIMAL) * 100, 2)
    END;
END;
$$;

-- Function to update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation timestamp when new message is added
CREATE TRIGGER update_conversation_last_message_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message(); 