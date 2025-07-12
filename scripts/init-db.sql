-- Initialize database for AI Project Team

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create extension for vector operations (when using pgvector)
-- CREATE EXTENSION IF NOT EXISTS vector;

-- Create basic tables
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

-- Insert sample data
INSERT INTO users (email, name, password_hash) VALUES 
  ('admin@aiprojectteam.com', 'Admin User', '$2b$10$example.hash.here')
ON CONFLICT (email) DO NOTHING;

INSERT INTO projects (name, description, owner_id) VALUES 
  ('Sample Project', 'A sample project for testing', (SELECT id FROM users WHERE email = 'admin@aiprojectteam.com'))
ON CONFLICT DO NOTHING; 