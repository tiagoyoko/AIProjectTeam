'use client'

import React, { useState, useEffect } from 'react'
import { NotionProjectData, NotionTask } from '@aiprojectteam/shared'

interface NotionIntegrationProps {
  projectId?: string
  onProjectSync?: (projectData: NotionProjectData) => void
}

export default function NotionIntegration({ projectId, onProjectSync }: NotionIntegrationProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [pages, setPages] = useState<any[]>([])
  const [selectedPageId, setSelectedPageId] = useState('')
  const [projectData, setProjectData] = useState<NotionProjectData | null>(null)
  const [error, setError] = useState('')

  // Verificar conexão com Notion
  useEffect(() => {
    checkNotionConnection()
  }, [])

  const checkNotionConnection = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/notion?action=pages')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setIsConnected(true)
          setPages(data.data || [])
        }
      }
    } catch (err) {
      console.error('Erro ao verificar conexão Notion:', err)
      setError('Erro ao conectar com Notion')
    } finally {
      setIsLoading(false)
    }
  }

  const importFromNotion = async (pageId: string) => {
    try {
      setIsLoading(true)
      setError('')
      
      const response = await fetch(`/api/notion?action=page&pageId=${pageId}`)
      const data = await response.json()
      
      if (data.success) {
        setProjectData(data.data)
        onProjectSync?.(data.data)
      } else {
        setError(data.error || 'Erro ao importar dados')
      }
    } catch (err) {
      console.error('Erro ao importar do Notion:', err)
      setError('Erro ao importar dados do Notion')
    } finally {
      setIsLoading(false)
    }
  }

  const exportToNotion = async (projectData: NotionProjectData) => {
    try {
      setIsLoading(true)
      setError('')
      
      const response = await fetch('/api/notion?action=export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert('Projeto exportado para Notion com sucesso!')
      } else {
        setError(data.error || 'Erro ao exportar dados')
      }
    } catch (err) {
      console.error('Erro ao exportar para Notion:', err)
      setError('Erro ao exportar dados para Notion')
    } finally {
      setIsLoading(false)
    }
  }

  const syncProject = async () => {
    if (!projectId || !selectedPageId) {
      setError('Selecione uma página do Notion para sincronizar')
      return
    }

    try {
      setIsLoading(true)
      setError('')
      
      const response = await fetch('/api/notion?action=sync', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          notionPageId: selectedPageId,
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert('Sincronização concluída com sucesso!')
      } else {
        setError(data.error || 'Erro na sincronização')
      }
    } catch (err) {
      console.error('Erro na sincronização:', err)
      setError('Erro na sincronização com Notion')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Integração Notion</h3>
        <div className="text-center">
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Conectando...</span>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-4">
                Não foi possível conectar com o Notion. Verifique as configurações.
              </p>
              <button
                onClick={checkNotionConnection}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Tentar Novamente
              </button>
            </div>
          )}
          {error && (
            <p className="text-red-600 mt-2">{error}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Integração Notion</h3>
      
      <div className="space-y-4">
        {/* Seleção de Página */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Página do Projeto
          </label>
          <select
            value={selectedPageId}
            onChange={(e) => setSelectedPageId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Selecione uma página</option>
            {pages.map((page) => (
              <option key={page.id} value={page.id}>
                {page.title || page.id}
              </option>
            ))}
          </select>
        </div>

        {/* Ações */}
        <div className="flex space-x-2">
          <button
            onClick={() => selectedPageId && importFromNotion(selectedPageId)}
            disabled={!selectedPageId || isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? 'Importando...' : 'Importar do Notion'}
          </button>
          
          <button
            onClick={() => projectData && exportToNotion(projectData)}
            disabled={!projectData || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Exportando...' : 'Exportar para Notion'}
          </button>
          
          {projectId && (
            <button
              onClick={syncProject}
              disabled={!selectedPageId || isLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {isLoading ? 'Sincronizando...' : 'Sincronizar'}
            </button>
          )}
        </div>

        {/* Dados Importados */}
        {projectData && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h4 className="font-medium mb-2">Dados Importados:</h4>
            <div className="space-y-2 text-sm">
              <p><strong>Título:</strong> {projectData.title}</p>
              <p><strong>Status:</strong> {projectData.status}</p>
              <p><strong>Stakeholders:</strong> {projectData.stakeholders.join(', ')}</p>
              {projectData.budget && (
                <p><strong>Orçamento:</strong> R$ {projectData.budget.toLocaleString()}</p>
              )}
              {projectData.timeline && (
                <p><strong>Timeline:</strong> {projectData.timeline.start} - {projectData.timeline.end}</p>
              )}
              {projectData.risks.length > 0 && (
                <p><strong>Riscos:</strong> {projectData.risks.join(', ')}</p>
              )}
            </div>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}