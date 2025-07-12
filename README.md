# AI Project Team - Equipe de Agentes de IA para Gestão de Projetos

Uma equipe de agentes de IA autônoma para apoiar a gestão de projetos e programas, atuando como um PMO digital.

## 🚀 Características

- **Equipe de Agentes Especializados**: Agentes dedicados para diferentes áreas de gestão de projetos
- **Integração WhatsApp**: Interação exclusiva via WhatsApp para máxima conveniência
- **Base de Conhecimento**: Supabase como banco vetorial e relacional
- **Monorepo TypeScript**: Arquitetura escalável com workspaces

## 🏗️ Arquitetura

Este projeto utiliza uma arquitetura de monorepo com:

```
AIProjectTeam/
├── apps/
│   ├── web/          # Frontend Next.js
│   └── api/          # Backend Fastify
├── packages/
│   ├── shared/       # Tipos e utilitários compartilhados
│   ├── ui/           # Componentes React reutilizáveis
│   └── config/       # Configurações ESLint/Prettier
├── tools/
│   └── scripts/      # Scripts de build e utilities
└── docs/
    └── ...           # Documentação do projeto
```

## 🛠️ Tecnologias

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Fastify, TypeScript
- **Database**: Supabase (PostgreSQL + pgvector)
- **Auth**: Supabase Auth
- **Messaging**: Evolution API (WhatsApp)
- **AI**: GPT-4 com modelo o3
- **DevOps**: Docker, GitHub Actions
- **Monorepo**: Turborepo + pnpm

## 📋 Pré-requisitos

- Node.js 18+
- pnpm 9.0+
- Docker & Docker Compose
- Git

## 🚀 Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/your-org/AIProjectTeam.git
   cd AIProjectTeam
   ```

2. **Instale as dependências**
   ```bash
   pnpm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   # Edite o arquivo .env com suas configurações
   ```

4. **Execute com Docker (recomendado)**
   ```bash
   pnpm docker:up
   ```

   Ou execute em modo desenvolvimento:
   ```bash
   pnpm dev
   ```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev                # Executar todos os serviços em modo dev
pnpm build             # Build de produção
pnpm lint              # Linting com ESLint
pnpm type-check        # Verificação de tipos TypeScript
pnpm test              # Executar testes

# Docker
pnpm docker:build      # Build das imagens Docker
pnpm docker:up         # Subir containers
pnpm docker:down       # Parar containers
pnpm docker:logs       # Ver logs dos containers
pnpm docker:clean      # Limpar containers e volumes
```

## 🌍 URLs de Desenvolvimento

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 🤖 Agentes Disponíveis

1. **Orchestrator**: Coordena e direciona solicitações
2. **Scope Management**: Gerenciamento de escopo e requisitos
3. **Schedule Management**: Planejamento e cronogramas
4. **Cost Management**: Análise financeira e orçamentos
5. **Risk Management**: Identificação e mitigação de riscos
6. **Stakeholder & Communication**: Gestão de stakeholders
7. **Performance & Indicators**: KPIs e métricas
8. **Methodology**: Seleção e customização de metodologias
9. **Integration**: Integrações com ferramentas externas
10. **Quality Management**: Controle de qualidade

## 🔗 Integrações Suportadas

- ClickUp
- Notion
- Trello
- Jira
- WhatsApp (via Evolution API)

## 🧪 Testes

```bash
# Executar todos os testes
pnpm test

# Executar testes com coverage
pnpm test:coverage

# Executar testes de um workspace específico
pnpm --filter @aiprojectteam/api test
```

## 📖 Estrutura de Desenvolvimento

### Workspaces

- `@aiprojectteam/web`: Interface web Next.js
- `@aiprojectteam/api`: API backend
- `@aiprojectteam/shared`: Tipos e utilitários compartilhados
- `@aiprojectteam/ui`: Biblioteca de componentes
- `@aiprojectteam/config`: Configurações de desenvolvimento

### Path Aliases

```typescript
// Exemplos de imports
import { User } from '@aiprojectteam/shared';
import { Button } from '@aiprojectteam/ui';
import { apiClient } from '@/lib/api';
```

## 🔒 Segurança

- End-to-end encryption para mensagens
- Autenticação via Supabase
- RLS (Row Level Security) no banco
- Logs de auditoria
- Validação de entrada com Zod

## 📚 Documentação

- [Arquitetura](./docs/architecture.md)
- [API Reference](./docs/api.md)
- [Deployment](./docs/deployment.md)
- [Contributing](./CONTRIBUTING.md)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'Add some amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

Para suporte, entre em contato através do WhatsApp integrado ou abra uma issue no GitHub.

---

**Desenvolvido com ❤️ pela equipe AI Project Team** 