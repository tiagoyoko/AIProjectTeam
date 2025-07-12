# Documentação: Performance e Monitoramento do Banco de Dados

## Visão Geral

Este documento descreve os procedimentos de backup, recuperação e monitoramento de performance implementados no projeto AIProjectTeam usando Supabase.

## 1. Backup e Recuperação

### Configuração de Backups Automáticos

- **Frequência**: Backups automáticos diários habilitados por padrão
- **Retenção**: Conforme plano do projeto Supabase
- **Tipo**: Point-in-time recovery disponível
- **Gerenciamento**: Infraestrutura nativa do Supabase

### Procedimentos de Recuperação

#### Através do Painel Supabase:

1. Acesse o painel do Supabase
2. Vá para a seção "Database" → "Backups"
3. Selecione o backup desejado
4. Clique em "Restore" e confirme a operação

#### Através da CLI:

```bash
# Listar backups disponíveis
supabase db dump --project-id fcmjqihdwhlgfljdewam

# Restaurar backup específico
supabase db restore --project-id fcmjqihdwhlgfljdewam --backup-id <backup-id>
```

### Teste de Recuperação

- **Frequência recomendada**: Mensal
- **Ambiente**: Staging/desenvolvimento
- **Validação**: Verificar integridade dos dados após restore

## 2. Monitoramento de Performance

### Extensões Habilitadas

- **pg_stat_statements**: Análise de queries SQL
- **pgaudit**: Auditoria avançada
- **auto_explain**: Análise automática de planos de execução
- **pg_cron**: Tarefas agendadas
- **pg_net**: Requisições HTTP

### Métricas Principais

- Tempo de execução de queries
- Uso de índices
- Bloqueios de tabelas
- Conexões ativas
- Uso de memória

### Queries de Monitoramento

#### Top 10 queries mais lentas:

```sql
SELECT
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    rows
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
```

#### Verificar uso de índices:

```sql
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

#### Monitorar bloqueios:

```sql
SELECT
    blocked_locks.pid AS blocked_pid,
    blocked_activity.usename AS blocked_user,
    blocking_locks.pid AS blocking_pid,
    blocking_activity.usename AS blocking_user,
    blocked_activity.query AS blocked_statement,
    blocking_activity.query AS current_statement_in_blocking_process
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
WHERE NOT blocked_locks.granted;
```

## 3. Índices Implementados

### Resumo por Tabela

- **agents**: 5 índices (capabilities GIN, status, type, last_active)
- **audit_logs**: 6 índices (timestamp, user, operation, table, record_id)
- **conversations**: 9 índices (user, agent, status, timestamps)
- **knowledge_base**: 10 índices (HNSW vectors, GIN full-text, categories)
- **messages**: 8 índices (conversation, user, timestamps, content)
- **projects**: 10 índices (owner, status, timestamps, metadata)
- **tasks**: 12 índices (project, assignee, status, priority, dependencies)
- **users**: 6 índices (email, role, status, timestamps)

### Índices Especializados

- **HNSW**: Para busca de similaridade em vectors
- **GIN**: Para full-text search e arrays
- **Compostos**: Para queries com múltiplas condições

## 4. Triggers de Auditoria

### Triggers Implementados

- **Auditoria completa**: INSERT, UPDATE, DELETE em tabelas críticas
- **Updated_at**: Atualização automática de timestamps
- **Especializados**: Search vectors, last_message

### Tabela audit_logs

- Captura todas as operações críticas
- Inclui timestamp, usuário, operação e dados alterados
- Indexada para consultas eficientes

## 5. Otimizações de Queries

### Padrões Otimizados

1. **Uso de índices compostos** para queries com múltiplas condições
2. **Índices parciais** para filtros frequentes
3. **Índices GIN** para busca em arrays e JSON
4. **Índices HNSW** para busca vetorial

### Queries Comuns Otimizadas

#### Buscar tarefas por projeto e status:

```sql
-- Otimizada com índice composto
SELECT * FROM tasks
WHERE project_id = $1 AND status = $2
ORDER BY priority DESC, created_at DESC;
```

#### Buscar conhecimento por similaridade:

```sql
-- Otimizada com índice HNSW
SELECT title, content, embedding <-> $1 AS distance
FROM knowledge_base
WHERE embedding <-> $1 < 0.8
ORDER BY distance
LIMIT 10;
```

#### Auditoria por período:

```sql
-- Otimizada com índice em changed_at
SELECT * FROM audit_logs
WHERE changed_at >= $1 AND changed_at <= $2
ORDER BY changed_at DESC;
```

## 6. Alertas e Notificações

### Configurações Recomendadas

- **Conexões**: Alerta quando > 80% do limite
- **Queries lentas**: Alerta para queries > 5 segundos
- **Espaço em disco**: Alerta quando > 85% usado
- **Bloqueios**: Alerta para bloqueios > 30 segundos

### Integração com Monitoring

- Painel nativo do Supabase
- Métricas exportáveis para Grafana/Prometheus
- Logs estruturados para análise

## 7. Manutenção Preventiva

### Tarefas Semanais

- Verificar queries lentas
- Analisar uso de índices
- Revisar logs de erro

### Tarefas Mensais

- Teste de recuperação
- Análise de crescimento de dados
- Otimização de queries problemáticas

### Tarefas Trimestrais

- Revisão completa de índices
- Análise de padrões de acesso
- Planejamento de capacidade

## 8. Troubleshooting

### Problemas Comuns

1. **Queries lentas**: Verificar plano de execução e índices
2. **Bloqueios**: Identificar queries conflitantes
3. **Alto uso de CPU**: Analisar queries frequentes
4. **Espaço em disco**: Verificar crescimento de tabelas

### Comandos Úteis

```sql
-- Verificar tamanho das tabelas
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Verificar conexões ativas
SELECT count(*) as active_connections
FROM pg_stat_activity
WHERE state = 'active';

-- Verificar queries em execução
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';
```

## Conclusão

Este documento serve como referência para manutenção e monitoramento contínuo do banco de dados. Deve ser atualizado conforme novas otimizações são implementadas.

**Última atualização**: 2025-07-12
**Responsável**: Sistema de Monitoramento AIProjectTeam
