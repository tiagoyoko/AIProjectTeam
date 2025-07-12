-- ===== ENUMS =====
-- User roles
CREATE TYPE user_role AS ENUM ('user', 'admin', 'agent');

-- Project status
CREATE TYPE project_status AS ENUM ('planning', 'active', 'on_hold', 'completed', 'cancelled');

-- Task status  
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'review', 'done', 'blocked');

-- Priority levels
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'critical');

-- Agent types
CREATE TYPE agent_type AS ENUM (
  'coordinator', 
  'analyst', 
  'planner', 
  'risk_manager', 
  'quality', 
  'resource', 
  'communication', 
  'integration', 
  'reporting', 
  'learning'
);

-- Content types for knowledge base
CREATE TYPE content_type AS ENUM ('document', 'faq', 'tutorial', 'template', 'best_practice');

-- Message types
CREATE TYPE message_type AS ENUM ('text', 'image', 'document', 'audio', 'video');

-- Sender types
CREATE TYPE sender_type AS ENUM ('user', 'agent', 'system');

-- Conversation status
CREATE TYPE conversation_status AS ENUM ('active', 'closed', 'archived'); 