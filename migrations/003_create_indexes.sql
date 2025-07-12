-- ===== PERFORMANCE INDEXES =====

-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Projects table indexes
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_priority ON projects(priority);
CREATE INDEX idx_projects_created_at ON projects(created_at);
CREATE INDEX idx_projects_end_date ON projects(end_date);
CREATE INDEX idx_projects_team_members ON projects USING GIN(team_members);
CREATE INDEX idx_projects_tags ON projects USING GIN(tags);

-- Tasks table indexes
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_tasks_completed_at ON tasks(completed_at);
CREATE INDEX idx_tasks_dependencies ON tasks USING GIN(dependencies);
CREATE INDEX idx_tasks_tags ON tasks USING GIN(tags);

-- Agents table indexes
CREATE INDEX idx_agents_type ON agents(type);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_last_active ON agents(last_active);
CREATE INDEX idx_agents_capabilities ON agents USING GIN(capabilities);

-- Knowledge base indexes
CREATE INDEX idx_knowledge_base_author_id ON knowledge_base(author_id);
CREATE INDEX idx_knowledge_base_content_type ON knowledge_base(content_type);
CREATE INDEX idx_knowledge_base_is_public ON knowledge_base(is_public);
CREATE INDEX idx_knowledge_base_created_at ON knowledge_base(created_at);
CREATE INDEX idx_knowledge_base_tags ON knowledge_base USING GIN(tags);

-- Vector similarity search index (HNSW for performance)
CREATE INDEX idx_knowledge_base_embedding ON knowledge_base USING hnsw (embedding vector_cosine_ops);

-- Full-text search index
CREATE INDEX idx_knowledge_base_search_vector ON knowledge_base USING GIN(search_vector);

-- Conversations table indexes
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_agent_id ON conversations(agent_id);
CREATE INDEX idx_conversations_whatsapp_number ON conversations(whatsapp_number);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_created_at ON conversations(created_at);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at);

-- Messages table indexes
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_sender_type ON messages(sender_type);
CREATE INDEX idx_messages_message_type ON messages(message_type);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_whatsapp_message_id ON messages(whatsapp_message_id);

-- ===== COMPOSITE INDEXES FOR COMMON QUERIES =====

-- Projects by owner and status
CREATE INDEX idx_projects_owner_status ON projects(owner_id, status);

-- Tasks by project and status
CREATE INDEX idx_tasks_project_status ON tasks(project_id, status);

-- Tasks by assignee and status
CREATE INDEX idx_tasks_assignee_status ON tasks(assignee_id, status);

-- Conversations by user and status
CREATE INDEX idx_conversations_user_status ON conversations(user_id, status);

-- Messages by conversation and created_at (for pagination)
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at DESC);

-- Knowledge base by public status and content type
CREATE INDEX idx_knowledge_base_public_type ON knowledge_base(is_public, content_type); 