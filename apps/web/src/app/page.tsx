'use client';

import { Button } from '@aiprojectteam/ui';
import { API_ENDPOINTS } from '@aiprojectteam/shared';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-8'>
        <header className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>
            AI Project Team
          </h1>
          <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
            Equipe de Agentes de IA para Gestão de Projetos
          </p>
        </header>

        <div className='max-w-4xl mx-auto'>
          <div className='bg-white rounded-lg shadow-lg p-8'>
            <h2 className='text-2xl font-semibold mb-6'>
              🚀 Ambiente de Desenvolvimento Configurado!
            </h2>

            <div className='grid md:grid-cols-2 gap-6'>
              <div className='space-y-4'>
                <h3 className='text-lg font-medium'>
                  ✅ Funcionalidades Implementadas:
                </h3>
                <ul className='space-y-2 text-gray-700'>
                  <li>• Monorepo com Turborepo + pnpm</li>
                  <li>• TypeScript com path aliases</li>
                  <li>• Docker para desenvolvimento</li>
                  <li>• ESLint + Prettier + Husky</li>
                  <li>• CI/CD com GitHub Actions</li>
                  <li>• Documentação completa</li>

                </ul>
              </div>

              <div className='space-y-4'>
                <h3 className='text-lg font-medium'>🔧 Tecnologias:</h3>
                <ul className='space-y-2 text-gray-700'>
                  <li>• Next.js 14 + React 18</li>
                  <li>• Fastify + TypeScript</li>
                  <li>• Supabase (PostgreSQL + pgvector)</li>
                  <li>• WhatsApp via Evolution API</li>
                  <li>• GPT-4 com modelo o3</li>
                </ul>
              </div>
            </div>

            <div className='mt-8 flex flex-col sm:flex-row gap-4 justify-center'>
              <Link href='/dashboard'>
                <button className='w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors'>
                  📊 Dashboard
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
