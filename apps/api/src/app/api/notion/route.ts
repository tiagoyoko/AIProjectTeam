import { NextRequest, NextResponse } from 'next/server'
import { NotionService, NotionIntegrationConfig, NotionProjectData } from '@aiprojectteam/shared'

// Configuração do serviço Notion
const notionConfig: NotionIntegrationConfig = {
  token: process.env.NOTION_TOKEN || '',
  workspaceId: process.env.NOTION_WORKSPACE_ID,
  defaultDatabaseId: process.env.NOTION_DEFAULT_DATABASE_ID
}

const notionService = new NotionService(notionConfig)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const pageId = searchParams.get('pageId')
    const databaseId = searchParams.get('databaseId')

    switch (action) {
      case 'pages':
        const pages = await notionService.getProjectPages()
        return NextResponse.json({ success: true, data: pages })

      case 'page':
        if (!pageId) {
          return NextResponse.json({ 
            success: false, 
            error: 'pageId é obrigatório' 
          }, { status: 400 })
        }
        const projectData = await notionService.importFromNotion(pageId)
        return NextResponse.json({ success: true, data: projectData })

      case 'tasks':
        if (!pageId) {
          return NextResponse.json({ 
            success: false, 
            error: 'pageId é obrigatório' 
          }, { status: 400 })
        }
        const tasks = await notionService.getProjectTasks(pageId)
        return NextResponse.json({ success: true, data: tasks })

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Ação inválida. Use: pages, page, tasks' 
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Erro na API Notion:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const body = await request.json()

    switch (action) {
      case 'create-project':
        const newPage = await notionService.createProjectPage(body)
        return NextResponse.json({ success: true, data: newPage })

      case 'create-task':
        const { projectPageId, task } = body
        if (!projectPageId || !task) {
          return NextResponse.json({ 
            success: false, 
            error: 'projectPageId e task são obrigatórios' 
          }, { status: 400 })
        }
        const newTask = await notionService.createTask(projectPageId, task)
        return NextResponse.json({ success: true, data: newTask })

      case 'export':
        const exportedPage = await notionService.exportToNotion(body)
        return NextResponse.json({ success: true, data: exportedPage })

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Ação inválida. Use: create-project, create-task, export' 
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Erro na API Notion:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const body = await request.json()

    switch (action) {
      case 'update-project':
        const { pageId, updates } = body
        if (!pageId || !updates) {
          return NextResponse.json({ 
            success: false, 
            error: 'pageId e updates são obrigatórios' 
          }, { status: 400 })
        }
        const updatedPage = await notionService.updateProjectPage(pageId, updates)
        return NextResponse.json({ success: true, data: updatedPage })

      case 'update-task':
        const { taskId, taskUpdates } = body
        if (!taskId || !taskUpdates) {
          return NextResponse.json({ 
            success: false, 
            error: 'taskId e taskUpdates são obrigatórios' 
          }, { status: 400 })
        }
        const updatedTask = await notionService.updateTask(taskId, taskUpdates)
        return NextResponse.json({ success: true, data: updatedTask })

      case 'sync':
        const { projectId, notionPageId } = body
        if (!projectId || !notionPageId) {
          return NextResponse.json({ 
            success: false, 
            error: 'projectId e notionPageId são obrigatórios' 
          }, { status: 400 })
        }
        await notionService.syncProjectData(projectId, notionPageId)
        return NextResponse.json({ success: true, message: 'Sincronização concluída' })

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Ação inválida. Use: update-project, update-task, sync' 
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Erro na API Notion:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'