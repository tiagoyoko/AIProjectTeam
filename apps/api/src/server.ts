import Fastify from 'fastify'
import cors from '@fastify/cors'
import { NotionService, NotionIntegrationConfig } from '@aiprojectteam/shared'

// Configuração do servidor Fastify
const fastify = Fastify({
  logger: true
})

// Registrar CORS
await fastify.register(cors, {
  origin: true
})

// Configuração do serviço Notion
const notionConfig: NotionIntegrationConfig = {
  token: process.env.NOTION_TOKEN || '',
  workspaceId: process.env.NOTION_WORKSPACE_ID,
  defaultDatabaseId: process.env.NOTION_DEFAULT_DATABASE_ID
}

const notionService = new NotionService(notionConfig)

// Rotas do Notion
fastify.get('/api/notion', async (request, reply) => {
  try {
    const { action, pageId, databaseId } = request.query as any

    switch (action) {
      case 'pages':
        const pages = await notionService.getProjectPages()
        return { success: true, data: pages }

      case 'page':
        if (!pageId) {
          return reply.status(400).send({ 
            success: false, 
            error: 'pageId é obrigatório' 
          })
        }
        const projectData = await notionService.importFromNotion(pageId)
        return { success: true, data: projectData }

      case 'tasks':
        if (!pageId) {
          return reply.status(400).send({ 
            success: false, 
            error: 'pageId é obrigatório' 
          })
        }
        const tasks = await notionService.getProjectTasks(pageId)
        return { success: true, data: tasks }

      default:
        return reply.status(400).send({ 
          success: false, 
          error: 'Ação inválida. Use: pages, page, tasks' 
        })
    }
  } catch (error) {
    fastify.log.error('Erro na API Notion:', error)
    return reply.status(500).send({ 
      success: false, 
      error: 'Erro interno do servidor' 
    })
  }
})

fastify.post('/api/notion', async (request, reply) => {
  try {
    const { action } = request.query as any
    const body = request.body as any

    switch (action) {
      case 'create-project':
        const newPage = await notionService.createProjectPage(body)
        return { success: true, data: newPage }

      case 'create-task':
        const { projectPageId, task } = body
        if (!projectPageId || !task) {
          return reply.status(400).send({ 
            success: false, 
            error: 'projectPageId e task são obrigatórios' 
          })
        }
        const newTask = await notionService.createTask(projectPageId, task)
        return { success: true, data: newTask }

      case 'export':
        const exportedPage = await notionService.exportToNotion(body)
        return { success: true, data: exportedPage }

      default:
        return reply.status(400).send({ 
          success: false, 
          error: 'Ação inválida. Use: create-project, create-task, export' 
        })
    }
  } catch (error) {
    fastify.log.error('Erro na API Notion:', error)
    return reply.status(500).send({ 
      success: false, 
      error: 'Erro interno do servidor' 
    })
  }
})

fastify.put('/api/notion', async (request, reply) => {
  try {
    const { action } = request.query as any
    const body = request.body as any

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
        return { success: true, data: updatedPage }

      case 'update-task':
        const { taskId, taskUpdates } = body
        if (!taskId || !taskUpdates) {
          return reply.status(400).send({ 
            success: false, 
            error: 'taskId e taskUpdates são obrigatórios' 
          })
        }
        const updatedTask = await notionService.updateTask(taskId, taskUpdates)
        return { success: true, data: updatedTask }

      case 'sync':
        const { projectId, notionPageId } = body
        if (!projectId || !notionPageId) {
          return reply.status(400).send({ 
            success: false, 
            error: 'projectId e notionPageId são obrigatórios' 
          })
        }
        await notionService.syncProjectData(projectId, notionPageId)
        return { success: true, message: 'Sincronização concluída' }

      default:
        return reply.status(400).send({ 
          success: false, 
          error: 'Ação inválida. Use: update-project, update-task, sync' 
        })
    }
  } catch (error) {
    fastify.log.error('Erro na API Notion:', error)
    return reply.status(500).send({ 
      success: false, 
      error: 'Erro interno do servidor' 
    })
  }
})

// Rota de health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

export default fastify