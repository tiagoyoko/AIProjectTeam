'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../../../lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Tenta obter o usuário autenticado após o redirect do Supabase
        const { data: { user }, error } = await supabase.auth.getUser();

        if (user && !error) {
          // Usuário autenticado com sucesso, redireciona para o dashboard
          router.push('/dashboard');
        } else {
          // Se não autenticou, redireciona para login
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Erro durante callback de auth:', error);
        router.push('/auth/login');
      }
    };

    handleAuthCallback();
  }, [router]);

  // Loading state durante o processo de callback
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">Processando autenticação...</h2>
          <p className="mt-2 text-sm text-gray-600">
            Aguarde enquanto verificamos suas credenciais.
          </p>
        </div>
      </div>
    </div>
  );
} 