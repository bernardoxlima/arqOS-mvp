# Supabase Database - ArqExpress Unified Structure

Estrutura de banco de dados unificada para as aplicações ArqExpress (remix-of-budget-buddy, arqflow-ai, manual-arqexpress).

## Estrutura do Projeto

```
supabase/
├── migrations/
│   ├── 20260119000001_create_tables.sql          # Criação das 10 tabelas
│   ├── 20260119000002_create_indexes.sql         # Índices de performance
│   ├── 20260119000003_create_rls_policies.sql    # Políticas de segurança RLS
│   ├── 20260119000004_create_triggers_functions.sql  # Triggers e funções
│   ├── 20260119000005_create_storage_buckets.sql # Storage buckets e políticas
│   ├── 20260119000006_create_realtime_config.sql # Configuração Realtime
│   ├── 20260119000007_create_monitoring.sql      # Views de monitoramento
│   ├── 20260119000008_create_tests.sql           # Scripts de teste
│   ├── data/
│   │   ├── 01_migrate_remix_budget_buddy.sql     # Migração remix-of-budget-buddy
│   │   ├── 02_migrate_arqflow_ai.sql             # Migração arqflow-ai
│   │   └── 03_migrate_manual_arqexpress.sql      # Migração manual-arqexpress
│   └── rollback/
│       └── 20260119000001_rollback_tables.sql    # Script de rollback completo
├── functions/
│   ├── calculate-budget/
│   │   └── index.ts                              # Edge Function: cálculo de orçamento
│   └── sync-project-from-budget/
│       └── index.ts                              # Edge Function: criar projeto de orçamento
├── types/
│   └── database.ts                               # TypeScript types para o schema
├── seed.sql                                       # Dados iniciais (lookup_data)
└── README.md
```

## Como Executar

### Opção 1: Via Supabase CLI

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login no Supabase
supabase login

# Vincular ao projeto
supabase link --project-ref YOUR_PROJECT_REF

# Executar migrations
supabase db push

# Deploy Edge Functions
supabase functions deploy calculate-budget
supabase functions deploy sync-project-from-budget
```

### Opção 2: Via Dashboard SQL Editor

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Vá para **SQL Editor**
3. Execute os arquivos na ordem:
   1. `20260119000001_create_tables.sql`
   2. `20260119000002_create_indexes.sql`
   3. `20260119000003_create_rls_policies.sql`
   4. `20260119000004_create_triggers_functions.sql`
   5. `20260119000005_create_storage_buckets.sql`
   6. `20260119000006_create_realtime_config.sql`
   7. `20260119000007_create_monitoring.sql`
   8. `20260119000008_create_tests.sql`
   9. `seed.sql`

### Opção 3: Via psql

```bash
# Conectar ao banco
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Executar migrations
\i migrations/20260119000001_create_tables.sql
\i migrations/20260119000002_create_indexes.sql
# ... etc
```

## Estrutura do Banco

### Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| `organizations` | Escritórios (multi-tenant root) |
| `profiles` | Usuários vinculados ao Auth |
| `clients` | Clientes do escritório |
| `budgets` | Orçamentos e propostas |
| `projects` | Projetos em andamento |
| `time_entries` | Lançamento de horas |
| `project_items` | Itens/produtos do projeto |
| `finance_records` | Receitas e despesas |
| `lookup_data` | Dados de referência |
| `activity_log` | Auditoria de ações |

### Foreign Keys

O banco utiliza **apenas 1 Foreign Key real**:
- `profiles.user_id → auth.users.id`

Todas as outras referências são **soft references** (UUIDs sem constraint), permitindo:
- Melhor performance (sem JOINs cascateados)
- Facilidade de sharding por `organization_id`
- Snapshots históricos preservados

## Storage Buckets

| Bucket | Visibilidade | Uso |
|--------|--------------|-----|
| `avatars` | Público | Fotos de perfil |
| `project-images` | Privado | Imagens de projetos (renders, fotos) |
| `project-files` | Privado | Arquivos de projetos (PDF, DWG) |
| `proposals` | Privado | Propostas geradas em PDF |

## Edge Functions

### calculate-budget

Calcula preço de orçamento baseado em parâmetros.

```typescript
// POST /functions/v1/calculate-budget
{
  "organization_id": "uuid",
  "service_type": "decorexpress",
  "calc_mode": "room",
  "room_list": [{"id": 1, "name": "Sala", "size": "M"}],
  "complexity": "padrao",
  "finish": "alto_padrao"
}
```

### sync-project-from-budget

Cria projeto a partir de orçamento aprovado.

```typescript
// POST /functions/v1/sync-project-from-budget
{
  "budget_id": "uuid",
  "architect_id": "uuid",
  "start_date": "2026-02-01"
}
```

## TypeScript Types

Importe os types em sua aplicação:

```typescript
import { Database, ProjectRow, BudgetInsert } from './supabase/types/database'

// Uso com Supabase client
const supabase = createClient<Database>(url, key)

// Type-safe queries
const { data } = await supabase
  .from('projects')
  .select('*')
  .eq('status', 'em_andamento')

// data é ProjectRow[]
```

## Migração de Dados

### remix-of-budget-buddy

```sql
-- 1. Inserir dados exportados do localStorage
INSERT INTO _migration_remix_budget_buddy_raw (data_type, raw_data) VALUES
('budget', '{"id": 1, "clientName": "João", ...}'::jsonb);

-- 2. Executar migração
SELECT * FROM execute_remix_migration('org-uuid');
```

### arqflow-ai

```sql
-- 1. Inserir dados do contexto React
INSERT INTO _migration_arqflow_ai_raw (data_type, raw_data) VALUES
('office', '{"name": "Meu Escritório", ...}'::jsonb),
('team_member', '{"id": 1, "name": "Maria", ...}'::jsonb);

-- 2. Executar migração
SELECT * FROM execute_arqflow_migration();
```

### manual-arqexpress

```sql
-- 1. Exportar do browser e inserir
INSERT INTO _migration_manual_arqexpress_raw (data_type, project_key, raw_data) VALUES
('presentation', 'proj-001', '{"projectName": "...", ...}'::jsonb);

-- 2. Executar migração
SELECT * FROM execute_manual_migration('org-uuid');
```

## Monitoramento

### Views Disponíveis

```sql
-- Saúde do banco
SELECT * FROM db_health_metrics;

-- Tamanho das tabelas
SELECT * FROM table_sizes;

-- Métricas por organização
SELECT * FROM organization_metrics;

-- Performance de projetos
SELECT * FROM project_performance;

-- Produtividade da equipe
SELECT * FROM team_productivity;

-- Queries lentas
SELECT * FROM slow_queries;
```

### Alertas

```sql
-- Organizações que precisam de atenção
SELECT * FROM get_organizations_needing_attention();
```

## Testes

```sql
-- Executar todos os testes
SELECT * FROM run_all_tests();

-- Testes específicos
SELECT * FROM test_data_integrity();
SELECT * FROM test_rls_isolation();
SELECT * FROM test_triggers();
SELECT * FROM test_query_performance();
```

## Tipos de Serviço

| Código | Nome | Prefixo Projeto |
|--------|------|-----------------|
| `arquitetonico` | Projeto Arquitetônico | ARQ |
| `interiores` | Design de Interiores | INT |
| `decoracao` | Decoração | DEC |
| `reforma` | Reforma | REF |
| `comercial` | Comercial | COM |
| `decorexpress` | DecorExpress | DEX |
| `producao` | ProduzExpress | PRD |
| `projetexpress` | ProjetExpress | PEX |

## Roles de Usuário

| Role | Permissões |
|------|------------|
| `owner` | Acesso total, gerenciar organização |
| `coordinator` | Gerenciar equipe e projetos |
| `architect` | Acesso a projetos e clientes |
| `intern` | Acesso limitado |
| `admin` | Acesso administrativo/financeiro |

## Automações (Triggers)

1. **Auto-update `updated_at`** - Em profiles, projects, budgets
2. **Auto-create profile** - Quando novo usuário se registra
3. **Auto-generate codes** - PROP-YYNNN e PREFIX-YYNNN
4. **Auto-snapshot client** - Ao criar budget/project
5. **Auto-log activity** - Em creates/updates/deletes
6. **Auto-update hours** - Em projects quando time_entries mudam
7. **Auto-seed lookup_data** - Quando nova organization é criada

## Cron Jobs (pg_cron)

```sql
-- Verificar pagamentos atrasados (diário 8h)
SELECT cron.schedule('check-overdue', '0 8 * * *', 'SELECT check_overdue_finance_records()');

-- Limpar logs antigos (semanal domingo 3h)
SELECT cron.schedule('cleanup-logs', '0 3 * * 0', 'SELECT cleanup_old_activity_logs()');

-- Atualizar estatísticas (diário 4h)
SELECT cron.schedule('update-stats', '0 4 * * *', 'SELECT update_table_statistics()');
```

## Rollback

**ATENÇÃO: O rollback apaga todos os dados!**

```sql
-- Criar backup antes
pg_dump "postgresql://..." > backup.sql

-- Executar rollback
\i migrations/rollback/20260119000001_rollback_tables.sql
```

## Realtime

Tabelas com realtime habilitado:
- `projects` - Atualizações de kanban
- `time_entries` - Dashboard de horas
- `activity_log` - Feed de atividades
- `budgets` - Status de propostas
- `finance_records` - Dashboard financeiro

```typescript
// Exemplo de subscription
supabase
  .channel('projects')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'projects',
    filter: `organization_id=eq.${orgId}`
  }, handleChange)
  .subscribe()
```

## Backup

```bash
# Backup manual
pg_dump "postgresql://..." > backup_$(date +%Y%m%d).sql

# Restore
psql "postgresql://..." < backup_20260119.sql
```

## Suporte

Para dúvidas ou problemas:
1. Verificar logs no Supabase Dashboard
2. Executar testes: `SELECT * FROM run_all_tests();`
3. Verificar métricas: `SELECT * FROM db_health_metrics;`
