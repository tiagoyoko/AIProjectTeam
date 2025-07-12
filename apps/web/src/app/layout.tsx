import React from 'react';
import './globals.css';
import AuthWrapper from '@/components/AuthWrapper';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>AI Project Team</title>
        <meta name="description" content="Equipe de Agentes de IA para Gestão de Projetos" />
      </head>
      <body>
        <AuthWrapper>
          <div id="app">{children}</div>
        </AuthWrapper>
      </body>
    </html>
  );
} 