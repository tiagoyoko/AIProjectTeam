import { FastifyRequest, FastifyReply } from 'fastify'
import { NotionService, NotionIntegrationConfig, NotionProjectData } from '@aiprojectteam/shared'

// Configuração do serviço Notion
const notionConfig: NotionIntegrationConfig = {
  token: process.env.NOTION_TOKEN || '',
  workspaceId: process.env.NOTION_WORKSPACE_ID,
  defaultDatabaseId: process.env.NOTION_DEFAULT_DATABASE_ID
}

const notionService = new NotionService(notionConfig)

export async function GET(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const pageId = searchParams.get('pageId')
    const databaseId = searchParams.get('databaseId')

    switch (action) {
      case 'pages':
        const pages = await notionService.getProjectPages()
        return reply.send({ success: true, data: pages })

      case 'page':
        if (!pageId) {
          return reply.status(400).send({ 
            success: false, 
            error: 'pageId é obrigatório' 
          })
        }
        const projectData = await notionService.importFromNotion(pageId)
        return reply.send({ success: true, data: projectData })

      case 'tasks':
        if (!pageId) {
          return reply.status(400).send({ 
            success: false, 
            error: 'pageId é obrigatório' 
          })
        }
        const tasks = await notionService.getProjectTasks(pageId)
        return reply.send({ success: true, data: tasks })

      default:
        return reply.status(400).send({ 
          success: false, 
          error: 'Ação inválida. Use: pages, page, tasks' 
        })
    }
  } catch (error) {
    console.error('Erro na API Notion:', error)
    return reply.status(500).send({ 
      success: false, 
      error: 'Erro interno do servidor' 
    })
  }
}

export async function POST(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const body = await request.body as any

    switch (action) {
      case 'create-project':
        const newPage = await notionService.createProjectPage(body)
        return reply.send({ success: true, data: newPage })

      case 'create-task':
        const { projectPageId, task } = body
        if (!projectPageId || !task) {
          return reply.status(400).send({ 
            success: false, 
            error: 'projectPageId e task são obrigatórios' 
          })
        }
        const newTask = await notionService.createTask(projectPageId, task)
        return reply.send({ success: true, data: newTask })

      case 'export':
        const exportedPage = await notionService.exportToNotion(body)
        return reply.send({ success: true, data: exportedPage })

      default:
        return reply.status(400).send({ 
          success: false, 
          error: 'Ação inválida. Use: create-project, create-task, export' 
        })
    }
  } catch (error) {
    console.error('Erro na API Notion:', error)
    return reply.status(500).send({ 
      success: false, 
      error: 'Erro interno do servidor' 
    })
  }
}

export async function PUT(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const body = await request.body as any

    switch (action) {
      case 'update-project':
        const { pageId, updates } = body
        if (!pageId || !updates) {
          return reply.status(400).send({ 
            success: false, 
            error: 'pageId e updates são obrigatórios' 
          })
        }
        const updatedPage = await notionService.updateProjectPage(pageId, updates)
        return reply.send({ success: true, data: updatedPage })

      case 'update-task':
        const { taskId, taskUpdates } = body
        if (!taskId || !taskUpdates) {
          return reply.status(400).send({ 
            success: false, 
            error: 'taskId e taskUpdates são obrigatórios' 
          })
        }
        const updatedTask = await notionService.updateTask(taskId, taskUpdates)
        return reply.send({ success: true, data: updatedTask })

      case 'sync':
        const { projectId, notionPageId } = body
        if (!projectId || !notionPageId) {
          return reply.status(400).send({ 
            success: false, 
            error: 'projectId e notionPageId são obrigatórios' 
          })
        }
        await notionService.syncProjectData(projectId, notionPageId)
        return reply.send({ success: true, message: 'Sincronização concluída' })

      default:
        return reply.status(400).send({ 
          success: false, 
          error: 'Ação inválida. Use: update-project, update-task, sync' 
        })
    }
  } catch (error) {
    console.error('Erro na API Notion:', error)
    return reply.status(500).send({ 
      success: false, 
      error: 'Erro interno do servidor' 
    })
  }
}