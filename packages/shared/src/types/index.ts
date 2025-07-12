/**
 * 🎯 ARQUIVO ÚNICO DE REFERÊNCIA - PONTO ÚNICO DE VERDADE
 *
 * Este arquivo centraliza TODOS os tipos e schemas do projeto.
 * SEMPRE importe deste arquivo, nunca diretamente dos arquivos específicos.
 *
 * Exemplo correto:
 * import { User, UserSchema, Database } from '@/types';
 *
 * Exemplo incorreto:
 * import { User } from '@/types/database';
 * import { UserSchema } from '@/schemas/user';
 */

import * as React from 'react';

// ===== DATABASE TYPES =====
export * from './database';

// ===== SCHEMAS ZOD =====
export * from '../schemas';

// ===== API TYPES =====
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
  details?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, any>;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

// ===== COMPONENT TYPES =====
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  onChange?: (_value: string) => void;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface TableProps<T> extends BaseComponentProps {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (_page: number) => void;
  };
}

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (_value: any, _row: T) => React.ReactNode;
}

// ===== FORM TYPES =====
export interface FormField {
  name: string;
  label: string;
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'select'
    | 'textarea'
    | 'checkbox'
    | 'radio';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (_value: any) => string | undefined;
  };
}

export interface FormConfig {
  fields: FormField[];
  onSubmit: (_data: Record<string, any>) => void | Promise<void>;
  initialValues?: Record<string, any>;
  loading?: boolean;
}

// ===== AGENT TYPES =====
export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface AgentConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  tools: string[];
  capabilities: AgentCapability[];
}

export interface AgentPerformance {
  tasksCompleted: number;
  averageResponseTime: number;
  successRate: number;
  userSatisfaction: number;
  lastEvaluated: string;
}

// ===== PROJECT MANAGEMENT TYPES =====
export interface ProjectMetrics {
  tasksTotal: number;
  tasksCompleted: number;
  tasksInProgress: number;
  tasksBlocked: number;
  progressPercentage: number;
  estimatedCompletion: string;
  budgetUsed: number;
  budgetRemaining: number;
}

export interface TaskDependency {
  id: string;
  type: 'blocks' | 'requires' | 'relates_to';
  description?: string;
}

export interface TimeTracking {
  taskId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  description?: string;
  billable: boolean;
}

// ===== WHATSAPP INTEGRATION TYPES =====
export interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  body: string;
  type: 'text' | 'image' | 'document' | 'audio' | 'video';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  metadata?: Record<string, any>;
}

export interface WhatsAppContact {
  number: string;
  name?: string;
  profilePicture?: string;
  isBlocked: boolean;
  lastSeen?: string;
}

// ===== KNOWLEDGE BASE TYPES =====
export interface KnowledgeSearchResult {
  id: string;
  title: string;
  content: string;
  similarity: number;
  metadata: Record<string, any>;
}

export interface EmbeddingConfig {
  model: string;
  dimensions: number;
  provider: 'openai' | 'cohere' | 'huggingface';
}

// ===== UTILITY TYPES =====
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type NonEmptyArray<T> = [T, ...T[]];

export type ValueOf<T> = T[keyof T];

export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];



// ===== CONSTANTS =====
export const SUPPORTED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const PAGINATION_LIMITS = {
  MIN: 1,
  MAX: 100,
  DEFAULT: 20,
} as const;

export const CACHE_KEYS = {
  USER: 'user',
  PROJECTS: 'projects',
  AGENTS: 'agents',
  KNOWLEDGE_BASE: 'knowledge_base',
} as const;

// ===== TYPE GUARDS =====
export function isApiError(response: any): response is ErrorResponse {
  return (
    response && response.success === false && typeof response.error === 'string'
  );
}

export function isApiSuccess<T>(response: any): response is SuccessResponse<T> {
  return response && response.success === true && response.data !== undefined;
}

export function isPaginatedResponse<T>(
  response: any
): response is PaginatedResponse<T> {
  return response && Array.isArray(response.items) && response.pagination;
}

export function isValidUUID(_str: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(_str);
}

export function isValidEmail(_email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(_email);
}
