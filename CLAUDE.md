# CLAUDE.md - Project Context & Development Guidelines

<DEVCORE>
## Development Principles

### Core Philosophy
100% signal, 0% noise. Every action must move the needle and drive real results.

### Before Coding
- NEVER start implementing without full context
- ASK about: defined stack, UI libraries, existing patterns
- If no PRD or clear spec exists, request or create one before proceeding
- Understand the problem completely before writing any code

### Coding Standards
- Clean code: readable, simple, self-documenting
- No over-engineering: solve the current problem, not hypothetical future ones
- Test-Driven Development: write tests first, then implement
- Follow existing nomenclature and folder structures strictly
- Check existing code before creating new patterns

### Implementation Order (Vertical Slices)
For each feature, implement in this mandatory sequence:
1. Schema/Database
2. Backend logic/API
3. Interface/Frontend
4. Polish and tests

**NEVER build all backend first, then all frontend.**

### During Implementation
- Validate: security, return types, error handling, schema consistency
- If context is incomplete, ASK before assuming

### After Each Implementation
- Document what was created/modified
- Update relevant context files (CLAUDE.md, README, docs, etc.)
- Always keep the documentation and CLAUDE.md files up to date with updated info, implementations, techs about the application
</DEVCORE>

## Project Overview

**ArqOS** - Sistema unificado para escritórios de arquitetura e design de interiores.

Unificação de 3 repositórios (agora em `/legacy/`):
- `arqflow-ai` - Gestão de projetos, AI (briefing, brandbook), calculadora
- `manual-de-apreenta-o-arqexpress-duplicado-v2` - Apresentações, upload de imagens, geração PPTX/Excel
- `remix-of-budget-buddy` - Orçamentação, Kanban, geração PDF/Word

---

## Tech Stack (Implementado)

| Layer | Technology | Version |
|-------|------------|---------|
| **Framework** | Next.js (App Router) | 15.5.9 |
| **Language** | TypeScript (strict) | 5.7.3 |
| **Styling** | Tailwind CSS | 4.0.0 |
| **UI Components** | shadcn/ui + Radix UI | latest |
| **State Management** | TanStack React Query + Context | - |
| **Forms** | React Hook Form + Zod | 7.71.1 / 4.3.5 |
| **Database/Auth** | Supabase (SSR) | 2.91.0 |
| **AI Provider** | OpenRouter (Claude, GPT, Gemini) | - |
| **Document Generation** | pptxgenjs, xlsx, jsPDF, docx | - |
| **Testing** | Vitest + Testing Library + Playwright | 4.0.17 / 1.57.0 |

---

## Project Structure (Implementado)

```
arqOS-mvp/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/               # Auth routes (public)
│   │   │   ├── layout.tsx        # Auth layout
│   │   │   ├── login/page.tsx    # Login page
│   │   │   └── cadastro/page.tsx # Register page
│   │   ├── (dashboard)/          # Protected routes
│   │   │   ├── layout.tsx        # Dashboard layout with sidebar
│   │   │   ├── projetos/         # Projects module (implemented)
│   │   │   │   ├── page.tsx      # Projects list with Kanban
│   │   │   │   └── [id]/page.tsx # Project detail page
│   │   │   ├── calculadora/      # Calculator module (implemented)
│   │   │   │   └── page.tsx      # Calculator with real-time pricing
│   │   │   ├── orcamentos/       # Budgets module (pending)
│   │   │   ├── apresentacoes/    # Presentations module (pending)
│   │   │   └── financeiro/       # Financial module (pending)
│   │   ├── api/                  # API Routes
│   │   │   ├── auth/callback/    # Auth callback route
│   │   │   ├── projects/         # Projects CRUD endpoints
│   │   │   │   ├── route.ts      # GET (list) + POST (create)
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts  # GET/PUT/DELETE by ID
│   │   │   │       ├── stage/    # POST - Move to stage
│   │   │   │       ├── stages/   # GET - Get workflow stages
│   │   │   │       ├── time-entry/ # POST - Add time entry
│   │   │   │       └── timeline/ # GET - Project timeline
│   │   │   ├── calculator/       # Budget calculation endpoints
│   │   │   │   ├── calculate/    # POST - Calculate budget
│   │   │   │   └── config/       # GET - Get pricing config
│   │   │   ├── ai/               # OpenRouter integrations
│   │   │   └── documents/        # PDF, PPTX, Excel generation
│   │   ├── globals.css           # Tailwind + shadcn/ui theme
│   │   ├── layout.tsx            # Root layout with AuthProvider
│   │   └── page.tsx              # Home page
│   │
│   ├── modules/                  # Feature modules (DDD-like)
│   │   ├── auth/                 # Authentication module
│   │   │   ├── context.tsx       # AuthProvider + useAuthContext
│   │   │   ├── hooks/use-auth.ts # useAuth hook
│   │   │   ├── schemas.ts        # Zod validation schemas
│   │   │   ├── types.ts          # TypeScript types
│   │   │   └── index.ts          # Public exports
│   │   ├── budgets/
│   │   ├── projects/             # Projects module (Kanban + CRUD)
│   │   │   ├── types/index.ts    # TypeScript types
│   │   │   ├── schemas.ts        # Zod validation schemas
│   │   │   ├── constants/stages.ts # Workflow stages by service type
│   │   │   ├── services/
│   │   │   │   ├── projects.service.ts # CRUD operations
│   │   │   │   └── kanban.ts     # Kanban operations
│   │   │   ├── components/       # UI components
│   │   │   │   ├── project-card.tsx    # Project card with progress
│   │   │   │   ├── project-modal.tsx   # Create/edit modal
│   │   │   │   ├── kanban-board.tsx    # Kanban board with DnD
│   │   │   │   ├── kanban-column.tsx   # Kanban column
│   │   │   │   ├── kanban-card.tsx     # Kanban card
│   │   │   │   ├── time-entry-modal.tsx # Time entry modal
│   │   │   │   └── empty-state.tsx     # Empty state component
│   │   │   ├── hooks/
│   │   │   │   └── use-projects.ts # Projects state management
│   │   │   ├── __tests__/        # Unit tests
│   │   │   └── index.ts          # Public exports
│   │   ├── presentations/
│   │   ├── calculator/           # Budget calculator module
│   │   │   ├── types.ts          # TypeScript types
│   │   │   ├── schemas.ts        # Zod validation schemas
│   │   │   ├── pricing-data.ts   # Default pricing configuration
│   │   │   ├── calculator-engine.ts # Core calculation logic
│   │   │   ├── components/       # UI components
│   │   │   │   ├── calculator-wizard.tsx  # Main wizard with steps
│   │   │   │   ├── step-service.tsx       # Service selection step
│   │   │   │   ├── step-environments.tsx  # Environment config step
│   │   │   │   ├── step-area.tsx          # Area config step (ProjetExpress)
│   │   │   │   ├── step-options.tsx       # Options step (modality, payment)
│   │   │   │   ├── calculator-result.tsx  # Result display card
│   │   │   │   └── index.ts               # Component exports
│   │   │   ├── hooks/            # React hooks
│   │   │   │   └── use-calculator.ts
│   │   │   └── index.ts          # Public exports
│   │   ├── documents/
│   │   └── ai/
│   │
│   ├── shared/                   # Shared code
│   │   ├── components/
│   │   │   ├── ui/               # 23 shadcn/ui components
│   │   │   └── app-sidebar.tsx   # Main app sidebar
│   │   ├── hooks/
│   │   │   └── use-mobile.ts
│   │   ├── lib/
│   │   │   ├── supabase/
│   │   │   │   ├── client.ts     # Browser client
│   │   │   │   ├── server.ts     # Server client
│   │   │   │   ├── middleware.ts # Auth middleware
│   │   │   │   └── database.types.ts
│   │   │   └── utils.ts          # cn() helper
│   │   ├── types/
│   │   └── constants/
│   │
│   └── middleware.ts             # Next.js middleware (auth)
│
├── __tests__/
│   ├── e2e/                      # Playwright tests
│   │   └── home.spec.ts
│   ├── integration/
│   ├── setup.ts                  # Vitest setup
│   └── smoke.test.ts             # Smoke test
│
├── supabase/
│   ├── migrations/
│   └── functions/
│
├── legacy/                       # Original repos (reference)
│   ├── arqflow-ai/
│   ├── manual-de-apreenta-o-arqexpress-duplicado-v2/
│   └── remix-of-budget-buddy/
│
├── .env.example                  # Environment template
├── components.json               # shadcn/ui config
├── vitest.config.ts              # Vitest config
├── playwright.config.ts          # Playwright config
├── tailwind.config.ts            # Tailwind config (if needed)
├── tsconfig.json
└── package.json
```

---

## shadcn/ui Components (24 installed)

```
accordion, alert-dialog, avatar, badge, button, card, checkbox,
dialog, dropdown-menu, form, input, label, scroll-area, select,
separator, sheet, sidebar, skeleton, slider, sonner (toast), table,
tabs, textarea, tooltip
```

**Add new components:**
```bash
npx shadcn@latest add [component-name]
```

---

## AI Integration (OpenRouter)

```typescript
// src/shared/lib/openrouter.ts (to be created)
import OpenAI from 'openai';

export const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});
```

**Models used:**
| Feature | Model |
|---------|-------|
| Briefing/Brandbook | `anthropic/claude-3.5-sonnet` |
| Image prompts | `openai/gpt-4o` |
| Floor plan annotation | `google/gemini-2.0-flash-exp` |

---

## Database Schema (Supabase)

### Tables (13 total)
```
organizations        # Multi-tenant root entity
profiles             # Users linked to Supabase Auth
clients              # Client database
budgets              # Proposals and quotes
projects             # Projects with Kanban workflow
time_entries         # Time tracking per project
project_items        # Products/items linked to projects
finance_records      # Income and expenses
lookup_data          # Reference data (environments, categories, etc)
activity_log         # Audit trail (append-only)
presentations        # Presentation grouping entity
presentation_images  # Images by section (photos_before, moodboard, etc)
presentation_items   # Layout and complementary items
```

### Storage Buckets
```
avatars              # Public - user avatars
project-images       # Private - project images
project-files        # Private - documents (PDF, Word, etc)
proposals            # Private - generated proposals
presentation-images  # Private - presentation images
```

### Key Features
- **RLS (Row Level Security)** - Multi-tenant isolation by organization_id
- **Auto-generated codes** - PROP-YYNNN, ARQ-YYNNN, APRES-YYNNN
- **Triggers** - Auto updated_at, client snapshots, activity logging
- **Image limits per section** - photos_before(4), moodboard(1), references(6), floor_plan(1), renders(10)

---

## Implementation Status

### ✅ Fase 0: Setup (CONCLUÍDA)
- [x] Next.js 15.5.9 + TypeScript + Tailwind CSS 4
- [x] Estrutura de pastas completa
- [x] shadcn/ui com 23 componentes
- [x] Supabase SSR (client, server, middleware)
- [x] Vitest + Playwright configurados
- [x] Teste de sanidade passando

### ✅ Database Schema (COMPLETO)
- [x] Unified Supabase schema for all modules (13 tables + 5 storage buckets)
- [x] Presentations module tables (presentations, presentation_images, presentation_items)
- [x] RLS policies for multi-tenant isolation
- [x] Triggers and helper functions

### ✅ Fase 1: Auth (COMPLETA)
- [x] Tabela de perfis de usuário (já criada via migrations)
- [x] Trigger de auto-create profile no signup
- [x] Páginas de login/cadastro (frontend)
- [x] Proteção de rotas (middleware)
- [x] Context de autenticação + hook useAuth
- [x] Layout do dashboard com sidebar
- [x] API route de callback
- [x] Testes unitários (26 testes - schemas + context)
- [x] Testes E2E (18 testes - login, cadastro, rotas)

### ✅ Fase 2: Projetos - Backend (COMPLETA)
- [x] Módulo projects criado em `src/modules/projects/`
- [x] Types: Project, ProjectStatus, ServiceType, Modality, Workflow, etc.
- [x] Types CRUD: ProjectFilters, CreateProjectData, UpdateProjectData, ProjectWithClient
- [x] Schemas Zod: createProjectSchema, updateProjectSchema, projectFiltersSchema
- [x] Constantes de workflow por tipo de serviço:
  - DecorExpress Presencial: 15 etapas
  - DecorExpress Online: 12 etapas
  - Produção: 5 etapas
  - ProjetExpress: 9 etapas
- [x] Service CRUD: listProjects, getProjectById, createProject, updateProject, deleteProject
- [x] Service Kanban: moveProjectToStage, addTimeEntry, addCustomStage, getProjectStages, getProjectTimeline
- [x] API endpoints:
  - `GET /api/projects` - Listar com filtros e paginação
  - `POST /api/projects` - Criar projeto (auto-gera código e workflow)
  - `GET /api/projects/[id]` - Buscar por ID
  - `PUT /api/projects/[id]` - Atualizar projeto
  - `DELETE /api/projects/[id]` - Deletar projeto
  - `POST /api/projects/[id]/stage` - Mover para etapa
  - `GET /api/projects/[id]/stages` - Listar etapas do workflow
  - `POST /api/projects/[id]/time-entry` - Registrar horas
  - `GET /api/projects/[id]/timeline` - Timeline do projeto
- [x] Testes unitários (33 testes - schemas)

### ✅ Fase 2: Projetos - Frontend (COMPLETA)
- [x] Página de listagem de projetos (`/projetos`)
- [x] Visualizações: Grade, Lista e Kanban
- [x] Hook `useProjects` para gerenciamento de estado
- [x] Componentes em `src/modules/projects/components/`:
  - `ProjectCard` - Card de projeto com progresso
  - `ProjectModal` - Modal de criar projeto
  - `EmptyState` - Estado vazio
  - `KanbanBoard` - Quadro Kanban com drag-and-drop
  - `KanbanColumn` - Coluna do Kanban
  - `KanbanCard` - Card do Kanban
  - `TimeEntryModal` - Modal de registro de horas
- [x] Filtros por status e busca por nome/cliente
- [x] Página de detalhe do projeto (`/projetos/[id]`)
- [x] Linha do tempo visual das etapas
- [x] Confirmação de exclusão com AlertDialog

**Nota:** Usuários autenticados são redirecionados de `/` para `/projetos` (tela principal do app).

### ✅ Fase 3: Calculadora - Backend (COMPLETA)
- [x] Módulo calculator criado em `src/modules/calculator/`
- [x] Types e schemas Zod para validação
- [x] Dados de preços DecorExpress (1-3 ambientes, níveis 1-3)
- [x] Dados de preços Produção (1-3 ambientes, simples/completa)
- [x] Dados de preços ProjetExpress por m² (novo/reforma)
- [x] Multiplicadores: tipo ambiente (1.0-1.4x), tamanho P/M/G (1.0-1.15x)
- [x] Multiplicadores: complexidade (0.8-1.5x), acabamento (0.9-1.4x)
- [x] Motor de cálculo com estimativa de horas e eficiência
- [x] Endpoint POST `/api/calculator/calculate`
- [x] Endpoint GET `/api/calculator/config`
- [x] Hook `useCalculator` para frontend

### ✅ Fase 3: Calculadora - Frontend (COMPLETA)
- [x] Página de calculadora (`/calculadora`) com layout 7-5
- [x] Seleção de tipo de serviço (DecorExpress, Produção, ProjetExpress)
- [x] Configuração por serviço:
  - DecorExpress: quantidade ambientes, nível complexidade, config ambientes
  - Produção: quantidade ambientes, tipo produção, config ambientes
  - ProjetExpress: tipo projeto (novo/reforma), área em m²
- [x] Seleção de modalidade (Presencial/Online)
- [x] Painel de resultados com:
  - Card de horas estimadas
  - Referência de precificação (2x, 2.5x, 3x)
  - Valor final com breakdown de custos
  - Indicador de saúde (multiplier)
  - Sugestão AI
  - Badge de eficiência
- [x] Animações com framer-motion
- [x] Integração com hook `useCalculator`
- [ ] Botão salvar orçamento (pendente: módulo orçamentos)
- [ ] Botão gerar PDF (pendente: módulo documentos)

### 🔲 Fases 4-9
Ver `TODO.md` para detalhes completos.

---

## Testing Strategy

```
        ╱╲
       ╱  ╲        E2E (Playwright)
      ╱────╲
     ╱      ╲      Integration (Vitest + Testing Library)
    ╱────────╲
   ╱          ╲    Unit (Vitest)
  ╱────────────╲
```

**Coverage target:** 80% on `/modules`

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenRouter
OPENROUTER_API_KEY=your-openrouter-api-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Useful Commands

```bash
# Development
npm run dev           # Start dev server

# Building
npm run build         # Production build
npm run start         # Start production server
npm run lint          # Run ESLint

# Testing
npm run test          # Unit tests (watch mode)
npm run test:run      # Unit tests (single run)
npm run test:coverage # Coverage report
npm run test:e2e      # E2E tests (Playwright)
npm run test:e2e:ui   # E2E tests with UI

# Database
npx supabase db push
npx supabase gen types typescript --local > src/shared/lib/supabase/database.types.ts

# UI Components
npx shadcn@latest add [component]
```

---

## Related Files

- `TODO.md` - Task list with all phases
- `PLANO_UNIFICACAO_NEXTJS.md` - Full migration plan
- `supabase/migrations/` - Database schema
- `src/shared/lib/supabase/` - Supabase client config
- `legacy/` - Original repositories for reference

---

## Routing Structure

### Public Routes
- `/` - Landing page (redirects to `/projetos` if authenticated)
- `/login` - Login page
- `/cadastro` - Registration page

### Protected Routes (require authentication)
- `/projetos` - Projects list with Kanban (main dashboard)
- `/projetos/[id]` - Project detail page
- `/calculadora` - Budget calculator with real-time pricing (implemented)
- `/orcamentos` - Budgets list (pending)
- `/apresentacoes` - Presentations list (pending)
- `/financeiro` - Financial dashboard (pending)
- `/perfil` - User profile (pending)

**Middleware:** `src/shared/lib/supabase/middleware.ts` handles auth redirects.

---

**Última atualização:** 2026-01-20 (Calculator frontend components - wizard, steps, result)
