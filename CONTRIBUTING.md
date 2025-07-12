# Contribuindo para AI Project Team

Obrigado por considerar contribuir para o AI Project Team! Este documento contém diretrizes para contribuições.

## 🚀 Como Contribuir

### 1. Fork e Clone

```bash
# Fork o repositório no GitHub
# Clone seu fork
git clone https://github.com/your-username/AIProjectTeam.git
cd AIProjectTeam

# Adicione o repositório original como upstream
git remote add upstream https://github.com/original-org/AIProjectTeam.git
```

### 2. Configuração do Ambiente

```bash
# Instale as dependências
pnpm install

# Configure o ambiente
cp .env.example .env
# Edite o .env com suas configurações

# Execute os testes para garantir que tudo está funcionando
pnpm test
```

### 3. Padrões de Desenvolvimento

#### Estrutura de Branches

- `main`: Branch principal estável
- `develop`: Branch de desenvolvimento
- `feature/nome-da-feature`: Novas funcionalidades
- `fix/nome-do-fix`: Correções de bugs
- `docs/nome-da-doc`: Melhorias na documentação

#### Commits

Utilizamos [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Tipos de commit
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação, sem mudanças funcionais
refactor: refatoração sem mudanças funcionais
test: adição ou correção de testes
chore: mudanças na configuração, build, etc.

# Exemplos
git commit -m "feat: add cost estimation algorithm"
git commit -m "fix: resolve memory leak in agent orchestrator"
git commit -m "docs: update API documentation"
```

#### Código

- **TypeScript**: Tipagem estrita obrigatória
- **ESLint + Prettier**: Formatação automática
- **Testes**: Cobertura mínima de 80%
- **Documentação**: TSDoc para funções públicas

```typescript
/**
 * Calcula o custo estimado do projeto
 * @param tasks - Lista de tarefas do projeto
 * @param hourlyRate - Taxa por hora
 * @returns Custo total estimado
 */
export function calculateProjectCost(
  tasks: Task[],
  hourlyRate: number
): number {
  // implementação
}
```

### 4. Processo de Desenvolvimento

1. **Crie uma nova branch**
   ```bash
   git checkout -b feature/nova-funcionalidade
   ```

2. **Desenvolva e teste**
   ```bash
   # Desenvolva sua funcionalidade
   # Execute testes frequentemente
   pnpm test
   pnpm lint
   pnpm type-check
   ```

3. **Commit suas mudanças**
   ```bash
   git add .
   git commit -m "feat: add nova funcionalidade"
   ```

4. **Mantenha atualizado com upstream**
   ```bash
   git fetch upstream
   git rebase upstream/develop
   ```

5. **Push e abra Pull Request**
   ```bash
   git push origin feature/nova-funcionalidade
   # Abra PR no GitHub
   ```

## 📝 Guidelines Específicas

### Para Agentes de IA

- **Prompt Engineering**: Documente prompts complexos
- **Context Management**: Gerencie contexto adequadamente
- **Error Handling**: Implemente fallbacks robustos
- **Testing**: Teste cenários edge cases

```typescript
// Exemplo de agente bem documentado
export class ScopeManagementAgent {
  /**
   * Analisa requisitos e gera WBS
   * @param requirements - Requisitos do projeto
   * @param context - Contexto do projeto
   */
  async generateWBS(
    requirements: ProjectRequirements,
    context: ProjectContext
  ): Promise<WBS> {
    // implementação
  }
}
```

### Para Integrações

- **API Clients**: Use padrão Repository
- **Rate Limiting**: Implemente throttling
- **Webhooks**: Valide payloads
- **Error Recovery**: Retry com backoff

### Para Frontend

- **Componentes**: Reutilizáveis e acessíveis
- **State Management**: Zustand para estado global
- **Forms**: React Hook Form + Zod
- **Styling**: Tailwind CSS

## 🧪 Testes

### Estrutura de Testes

```
src/
├── components/
│   ├── Button.tsx
│   └── Button.test.tsx
├── services/
│   ├── AgentService.ts
│   └── AgentService.test.ts
└── utils/
    ├── helpers.ts
    └── helpers.test.ts
```

### Tipos de Testes

1. **Unit Tests**: Funções individuais
2. **Integration Tests**: Integração entre módulos
3. **E2E Tests**: Fluxos completos de usuário
4. **Agent Tests**: Comportamento dos agentes

```typescript
// Exemplo de teste de agente
describe('ScopeManagementAgent', () => {
  it('should generate WBS from requirements', async () => {
    const agent = new ScopeManagementAgent();
    const requirements = mockRequirements();
    
    const wbs = await agent.generateWBS(requirements);
    
    expect(wbs).toBeDefined();
    expect(wbs.tasks).toHaveLength(5);
  });
});
```

## 📋 Checklist de Pull Request

- [ ] Código segue os padrões estabelecidos
- [ ] Testes passando (`pnpm test`)
- [ ] Linting OK (`pnpm lint`)
- [ ] Type checking OK (`pnpm type-check`)
- [ ] Documentação atualizada
- [ ] CHANGELOG.md atualizado (se aplicável)
- [ ] Commits seguem Conventional Commits
- [ ] PR tem descrição clara do que foi feito

## 🐛 Reportando Bugs

Use o template de issue do GitHub:

```markdown
**Descrição do Bug**
Descrição clara do que está acontecendo.

**Passos para Reproduzir**
1. Vá para '...'
2. Clique em '....'
3. Execute '....'
4. Veja o erro

**Comportamento Esperado**
O que deveria acontecer.

**Screenshots**
Se aplicável, adicione screenshots.

**Ambiente**
- OS: [e.g. macOS, Linux, Windows]
- Node.js: [e.g. 18.17.0]
- pnpm: [e.g. 9.0.0]
```

## 💡 Sugerindo Funcionalidades

Para novas funcionalidades:

1. **Abra uma issue** primeiro para discussão
2. **Descreva o problema** que a funcionalidade resolve
3. **Proponha uma solução** com detalhes técnicos
4. **Considere alternativas** e trade-offs

## 🎯 Áreas que Precisam de Ajuda

- **Agentes de IA**: Melhorar prompt engineering
- **Integrações**: Adicionar suporte a novas ferramentas
- **Performance**: Otimizações de velocidade
- **Testes**: Aumentar cobertura de testes
- **Documentação**: Melhorar guias e exemplos
- **UX/UI**: Melhorar interface do usuário

## 📞 Comunidade

- **Issues**: Para bugs e solicitações de features
- **Discussions**: Para perguntas e discussões gerais
- **WhatsApp**: Para suporte direto (produção)

## 📚 Recursos Úteis

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Turborepo Handbook](https://turbo.build/repo/docs)

---

**Obrigado por contribuir! 🎉** 