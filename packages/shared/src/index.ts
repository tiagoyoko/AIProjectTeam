// Re-export all types from the single source of truth
export * from './types';

// API endpoints
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  USERS: '/api/users',
  PROJECTS: '/api/projects',
  AGENTS: '/api/agents',
  TASKS: '/api/tasks',
  KNOWLEDGE_BASE: '/api/knowledge-base',
  CONVERSATIONS: '/api/conversations',
  MESSAGES: '/api/messages',
} as const;

export type ApiEndpoint = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS];

// Utility types for API responses
export type ApiResponse<T> = {
  success: true;
  data: T;
  message?: string;
} | {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, any>;
};

export type PaginatedResponse<T> = {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
