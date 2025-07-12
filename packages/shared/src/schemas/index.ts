import { z } from 'zod';

// ===== ENUMS =====
export const UserRoleEnum = z.enum(['user', 'admin', 'agent']);
export const ProjectStatusEnum = z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']);
export const TaskStatusEnum = z.enum(['todo', 'in_progress', 'review', 'done', 'blocked']);
export const PriorityLevelEnum = z.enum(['low', 'medium', 'high', 'critical']);
export const AgentTypeEnum = z.enum([
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
]);
export const ContentTypeEnum = z.enum(['document', 'faq', 'tutorial', 'template', 'best_practice']);
export const MessageTypeEnum = z.enum(['text', 'image', 'document', 'audio', 'video']);
export const SenderTypeEnum = z.enum(['user', 'agent', 'system']);
export const ConversationStatusEnum = z.enum(['active', 'closed', 'archived']);

// ===== BASE SCHEMAS =====
export const BaseSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// ===== USER SCHEMAS =====
export const UserSchema = BaseSchema.extend({
  email: z.string().email('Email inválido'),
  name: z.string().min(1, 'Nome é obrigatório'),
  role: UserRoleEnum.default('user'),
  avatar_url: z.string().url().optional(),
  last_login: z.string().datetime().optional(),
  is_active: z.boolean().default(true),
  metadata: z.record(z.any()).optional(),
});

export const UserInsertSchema = UserSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  id: z.string().uuid().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const UserUpdateSchema = UserSchema.partial().omit({
  id: true,
  created_at: true,
}).extend({
  updated_at: z.string().datetime().optional(),
});

// ===== PROJECT SCHEMAS =====
export const ProjectSchema = BaseSchema.extend({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  status: ProjectStatusEnum.default('planning'),
  priority: PriorityLevelEnum.default('medium'),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  budget: z.number().positive().optional(),
  owner_id: z.string().uuid(),
  team_members: z.array(z.string().uuid()).default([]),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.any()).optional(),
});

export const ProjectInsertSchema = ProjectSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  id: z.string().uuid().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const ProjectUpdateSchema = ProjectSchema.partial().omit({
  id: true,
  created_at: true,
}).extend({
  updated_at: z.string().datetime().optional(),
});

// ===== TASK SCHEMAS =====
export const TaskSchema = BaseSchema.extend({
  project_id: z.string().uuid(),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  status: TaskStatusEnum.default('todo'),
  priority: PriorityLevelEnum.default('medium'),
  assignee_id: z.string().uuid().optional(),
  due_date: z.string().datetime().optional(),
  estimated_hours: z.number().positive().optional(),
  actual_hours: z.number().positive().optional(),
  dependencies: z.array(z.string().uuid()).default([]),
  tags: z.array(z.string()).default([]),
  completed_at: z.string().datetime().optional(),
  metadata: z.record(z.any()).optional(),
});

export const TaskInsertSchema = TaskSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  id: z.string().uuid().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const TaskUpdateSchema = TaskSchema.partial().omit({
  id: true,
  created_at: true,
}).extend({
  updated_at: z.string().datetime().optional(),
});

// ===== AGENT SCHEMAS =====
export const AgentSchema = BaseSchema.extend({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: AgentTypeEnum,
  description: z.string().min(1, 'Descrição é obrigatória'),
  capabilities: z.array(z.string()).default([]),
  status: z.enum(['active', 'inactive', 'maintenance']).default('active'),
  config: z.record(z.any()).default({}),
  performance_metrics: z.record(z.any()).optional(),
  last_active: z.string().datetime().optional(),
});

export const AgentInsertSchema = AgentSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  id: z.string().uuid().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const AgentUpdateSchema = AgentSchema.partial().omit({
  id: true,
  created_at: true,
}).extend({
  updated_at: z.string().datetime().optional(),
});

// ===== KNOWLEDGE BASE SCHEMAS =====
export const KnowledgeBaseSchema = BaseSchema.extend({
  title: z.string().min(1, 'Título é obrigatório'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  content_type: ContentTypeEnum.default('document'),
  tags: z.array(z.string()).default([]),
  embedding: z.array(z.number()).optional(),
  search_vector: z.string().optional(),
  author_id: z.string().uuid(),
  is_public: z.boolean().default(true),
  version: z.number().int().positive().default(1),
  metadata: z.record(z.any()).optional(),
});

export const KnowledgeBaseInsertSchema = KnowledgeBaseSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  id: z.string().uuid().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const KnowledgeBaseUpdateSchema = KnowledgeBaseSchema.partial().omit({
  id: true,
  created_at: true,
}).extend({
  updated_at: z.string().datetime().optional(),
});

// ===== CONVERSATION SCHEMAS =====
export const ConversationSchema = BaseSchema.extend({
  user_id: z.string().uuid(),
  agent_id: z.string().uuid().optional(),
  whatsapp_number: z.string().min(1, 'Número do WhatsApp é obrigatório'),
  status: ConversationStatusEnum.default('active'),
  context: z.record(z.any()).default({}),
  last_message_at: z.string().datetime().optional(),
});

export const ConversationInsertSchema = ConversationSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
}).extend({
  id: z.string().uuid().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export const ConversationUpdateSchema = ConversationSchema.partial().omit({
  id: true,
  created_at: true,
}).extend({
  updated_at: z.string().datetime().optional(),
});

// ===== MESSAGE SCHEMAS =====
export const MessageSchema = z.object({
  id: z.string().uuid(),
  conversation_id: z.string().uuid(),
  sender_type: SenderTypeEnum,
  sender_id: z.string().uuid().optional(),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  message_type: MessageTypeEnum.default('text'),
  whatsapp_message_id: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  created_at: z.string().datetime(),
});

export const MessageInsertSchema = MessageSchema.omit({
  id: true,
  created_at: true,
}).extend({
  id: z.string().uuid().optional(),
  created_at: z.string().datetime().optional(),
});

export const MessageUpdateSchema = MessageSchema.partial().omit({
  id: true,
  conversation_id: true,
  created_at: true,
});

// ===== API RESPONSE SCHEMAS =====
export const ApiSuccessSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    message: z.string().optional(),
  });

export const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.string().optional(),
  details: z.record(z.any()).optional(),
});

export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.union([ApiSuccessSchema(dataSchema), ApiErrorSchema]);

// ===== PAGINATION SCHEMAS =====
export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export const PaginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    pagination: PaginationSchema,
  });

// ===== TYPE EXPORTS =====
export type User = z.infer<typeof UserSchema>;
export type UserInsert = z.infer<typeof UserInsertSchema>;
export type UserUpdate = z.infer<typeof UserUpdateSchema>;

export type Project = z.infer<typeof ProjectSchema>;
export type ProjectInsert = z.infer<typeof ProjectInsertSchema>;
export type ProjectUpdate = z.infer<typeof ProjectUpdateSchema>;

export type Task = z.infer<typeof TaskSchema>;
export type TaskInsert = z.infer<typeof TaskInsertSchema>;
export type TaskUpdate = z.infer<typeof TaskUpdateSchema>;

export type Agent = z.infer<typeof AgentSchema>;
export type AgentInsert = z.infer<typeof AgentInsertSchema>;
export type AgentUpdate = z.infer<typeof AgentUpdateSchema>;

export type KnowledgeBase = z.infer<typeof KnowledgeBaseSchema>;
export type KnowledgeBaseInsert = z.infer<typeof KnowledgeBaseInsertSchema>;
export type KnowledgeBaseUpdate = z.infer<typeof KnowledgeBaseUpdateSchema>;

export type Conversation = z.infer<typeof ConversationSchema>;
export type ConversationInsert = z.infer<typeof ConversationInsertSchema>;
export type ConversationUpdate = z.infer<typeof ConversationUpdateSchema>;

export type Message = z.infer<typeof MessageSchema>;
export type MessageInsert = z.infer<typeof MessageInsertSchema>;
export type MessageUpdate = z.infer<typeof MessageUpdateSchema>;

export type ApiResponse<T> = z.infer<ReturnType<typeof ApiResponseSchema<z.ZodType<T>>>>;
export type PaginatedResponse<T> = z.infer<ReturnType<typeof PaginatedResponseSchema<z.ZodType<T>>>>;
export type Pagination = z.infer<typeof PaginationSchema>;

// ===== AUTH SCHEMAS =====
export const SignUpSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  name: z.string().min(1, 'Nome é obrigatório'),
  confirmPassword: z.string().min(6, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
});

export const SignInSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const ResetPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

export const UpdatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  email: z.string().email('Email inválido').optional(),
});

export const MFAEnrollSchema = z.object({
  factorType: z.literal('totp'),
});

export const MFAVerifySchema = z.object({
  factorId: z.string().min(1, 'ID do fator é obrigatório'),
  challengeId: z.string().min(1, 'ID do desafio é obrigatório'),
  code: z.string().min(6, 'Código deve ter 6 dígitos').max(6, 'Código deve ter 6 dígitos'),
});

export const MFAChallengeSchema = z.object({
  factorId: z.string().min(1, 'ID do fator é obrigatório'),
});

// ===== AUTH TYPE EXPORTS =====
export type SignUp = z.infer<typeof SignUpSchema>;
export type SignIn = z.infer<typeof SignInSchema>;
export type ResetPassword = z.infer<typeof ResetPasswordSchema>;
export type UpdatePassword = z.infer<typeof UpdatePasswordSchema>;
export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;
export type MFAEnroll = z.infer<typeof MFAEnrollSchema>;
export type MFAVerify = z.infer<typeof MFAVerifySchema>;
export type MFAChallenge = z.infer<typeof MFAChallengeSchema>; 