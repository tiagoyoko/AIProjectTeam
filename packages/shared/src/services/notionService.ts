import { z } from 'zod'

// Schemas de validação para dados do Notion
export const NotionPageSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  url: z.string().url(),
  created_time: z.string(),
  last_edited_time: z.string(),
  properties: z.record(z.any()).optional()
})

export const NotionDatabaseSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  url: z.string().url(),
  properties: z.record(z.any())
})

export const NotionBlockSchema = z.object({
  id: z.string(),
  type: z.string(),
  content: z.any().optional(),
  children: z.array(z.any()).optional()
})

export type NotionPage = z.infer<typeof NotionPageSchema>
export type NotionDatabase = z.infer<typeof NotionDatabaseSchema>
export type NotionBlock = z.infer<typeof NotionBlockSchema>

// Tipos para integração com agentes
export interface NotionIntegrationConfig {
  token: string
  workspaceId?: string
  defaultDatabaseId?: string
}

export interface NotionProjectData {
  pageId: string
  title: string
  status: string
  stakeholders: string[]
  budget?: number
  timeline?: {
    start: string
    end: string
  }
  risks: string[]
  tasks: NotionTask[]
}

export interface NotionTask {
  id: string
  title: string
  status: 'Not Started' | 'In Progress' | 'Done' | 'Blocked'
  assignee?: string
  dueDate?: string
  priority: 'Low' | 'Medium' | 'High'
  description?: string
}

// Serviço principal de integração com Notion
export class NotionService {
  private config: NotionIntegrationConfig

  constructor(config: NotionIntegrationConfig) {
    this.config = config
  }

  /**
   * Busca páginas de projeto no Notion
   */
  async getProjectPages(): Promise<NotionPage[]> {
    // Implementação via MCP será feita aqui
    throw new Error('Método a ser implementado com MCP')
  }

  /**
   * Cria uma nova página de projeto
   */
  async createProjectPage(projectData: Partial<NotionProjectData>): Promise<NotionPage> {
    // Implementação via MCP será feita aqui
    throw new Error('Método a ser implementado com MCP')
  }

  /**
   * Atualiza uma página de projeto existente
   */
  async updateProjectPage(pageId: string, updates: Partial<NotionProjectData>): Promise<NotionPage> {
    // Implementação via MCP será feita aqui
    throw new Error('Método a ser implementado com MCP')
  }

  /**
   * Busca tarefas de um projeto
   */
  async getProjectTasks(pageId: string): Promise<NotionTask[]> {
    // Implementação via MCP será feita aqui
    throw new Error('Método a ser implementado com MCP')
  }

  /**
   * Cria uma nova tarefa
   */
  async createTask(projectPageId: string, task: Omit<NotionTask, 'id'>): Promise<NotionTask> {
    // Implementação via MCP será feita aqui
    throw new Error('Método a ser implementado com MCP')
  }

  /**
   * Atualiza uma tarefa existente
   */
  async updateTask(taskId: string, updates: Partial<NotionTask>): Promise<NotionTask> {
    // Implementação via MCP será feita aqui
    throw new Error('Método a ser implementado com MCP')
  }

  /**
   * Sincroniza dados do projeto com o Notion
   */
  async syncProjectData(projectId: string, notionPageId: string): Promise<void> {
    // Implementação via MCP será feita aqui
    throw new Error('Método a ser implementado com MCP')
  }

  /**
   * Exporta dados do projeto para o Notion
   */
  async exportToNotion(projectData: NotionProjectData): Promise<NotionPage> {
    // Implementação via MCP será feita aqui
    throw new Error('Método a ser implementado com MCP')
  }

  /**
   * Importa dados do Notion para o projeto
   */
  async importFromNotion(pageId: string): Promise<NotionProjectData> {
    // Implementação via MCP será feita aqui
    throw new Error('Método a ser implementado com MCP')
  }
}

// Utilitários para conversão de dados
export class NotionDataConverter {
  /**
   * Converte dados do projeto para formato do Notion
   */
  static projectToNotionFormat(projectData: NotionProjectData): any {
    return {
      properties: {
        'Nome do Projeto': {
          title: [
            {
              text: {
                content: projectData.title
              }
            }
          ]
        },
        'Status': {
          select: {
            name: projectData.status
          }
        },
        'Stakeholders': {
          multi_select: projectData.stakeholders.map(stakeholder => ({
            name: stakeholder
          }))
        },
        'Orçamento': projectData.budget ? {
          number: projectData.budget
        } : undefined,
        'Data de Início': projectData.timeline?.start ? {
          date: {
            start: projectData.timeline.start
          }
        } : undefined,
        'Data de Término': projectData.timeline?.end ? {
          date: {
            start: projectData.timeline.end
          }
        } : undefined
      }
    }
  }

  /**
   * Converte dados do Notion para formato do projeto
   */
  static notionToProjectFormat(notionPage: any): NotionProjectData {
    const properties = notionPage.properties || {}
    
    return {
      pageId: notionPage.id,
      title: this.extractTitle(properties['Nome do Projeto']),
      status: properties['Status']?.select?.name || 'Em Andamento',
      stakeholders: properties['Stakeholders']?.multi_select?.map((item: any) => item.name) || [],
      budget: properties['Orçamento']?.number,
      timeline: {
        start: properties['Data de Início']?.date?.start,
        end: properties['Data de Término']?.date?.start
      },
      risks: properties['Riscos']?.multi_select?.map((item: any) => item.name) || [],
      tasks: [] // Será preenchido separadamente
    }
  }

  private static extractTitle(titleProperty: any): string {
    if (!titleProperty?.title) return ''
    return titleProperty.title.map((item: any) => item.text?.content || '').join('')
  }
}