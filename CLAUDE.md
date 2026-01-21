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
│   │   │   ├── dashboard/page.tsx # Dashboard home
│   │   │   ├── projetos/
│   │   │   ├── orcamentos/
│   │   │   ├── apresentacoes/
│   │   │   ├── financeiro/
│   │   │   └── perfil/           # Profile page
│   │   ├── (onboarding)/         # Onboarding routes (no sidebar)
│   │   │   ├── layout.tsx        # Centered layout
│   │   │   ├── welcome/page.tsx  # /welcome - Welcome screen
│   │   │   └── setup/page.tsx    # /setup - Setup wizard
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
│   │   │   ├── budgets/          # Budgets CRUD endpoints
│   │   │   │   ├── route.ts      # GET (list) + POST (create)
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts  # GET/PUT/DELETE by ID
│   │   │   │       └── items/    # POST/PUT/DELETE budget items
│   │   │   ├── calculator/       # Budget calculation endpoints
│   │   │   │   ├── calculate/    # POST - Calculate budget
│   │   │   │   └── config/       # GET - Get pricing config
│   │   │   ├── presentations/    # Presentations CRUD endpoints
│   │   │   │   ├── route.ts      # GET (list) + POST (create)
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts  # GET/PUT/DELETE by ID
│   │   │   │       ├── images/   # POST (upload), GET (list), PATCH (reorder)
│   │   │   │       │   └── [imageId]/ # DELETE image
│   │   │   │       └── items/    # POST (add), GET (list)
│   │   │   │           └── [itemId]/ # PATCH/DELETE/PUT item
│   │   │   ├── ai/               # OpenRouter integrations
│   │   │   ├── onboarding/       # Onboarding endpoints
│   │   │   │   ├── status/       # GET/PUT/DELETE - Setup status
│   │   │   │   └── complete/     # POST - Complete setup
│   │   │   ├── profile/          # Profile endpoints
│   │   │   │   ├── route.ts      # GET/PUT - Profile CRUD
│   │   │   │   └── avatar/       # POST/DELETE - Avatar upload
│   │   │   ├── dashboard/        # Dashboard endpoints
│   │   │   │   ├── stats/        # GET - Combined statistics
│   │   │   │   ├── projects/recent/ # GET - Recent projects
│   │   │   │   └── finance/summary/ # GET - Finance summary
│   │   │   └── documents/        # Document generation endpoints
│   │   │       ├── presentations/[id]/
│   │   │       │   ├── ppt/      # POST - Generate presentation PPT
│   │   │       │   ├── shopping-list/ # POST - Generate shopping list PPT
│   │   │       │   ├── budget/   # POST - Generate budget PPT/Excel
│   │   │       │   └── detailing/ # POST - Generate technical PPT
│   │   │       └── proposals/    # POST - Generate PDF/Word proposals
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
│   │   ├── budgets/              # Budgets module (CRUD + Items)
│   │   │   ├── types/index.ts    # TypeScript types
│   │   │   ├── schemas.ts        # Zod validation schemas
│   │   │   ├── constants/defaults.ts # Default values, multipliers
│   │   │   ├── services/
│   │   │   │   └── budgets.service.ts # CRUD + item management
│   │   │   ├── utils/
│   │   │   │   └── calculations.ts # Helper functions
│   │   │   ├── __tests__/        # Unit tests (55 tests)
│   │   │   └── index.ts          # Public exports
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
│   │   ├── presentations/        # Presentations module
│   │   │   ├── types/index.ts    # TypeScript types (ImageSection, ItemCategory, etc.)
│   │   │   ├── services/
│   │   │   │   ├── presentations.service.ts # CRUD operations
│   │   │   │   ├── images.service.ts  # Image upload/delete
│   │   │   │   └── items.service.ts   # Items CRUD
│   │   │   └── index.ts          # Public exports
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
│   │   ├── documents/            # Document generation module
│   │   │   ├── types/index.ts    # TypeScript types for all generators
│   │   │   ├── utils/pptx-helpers.ts  # Shared PPT utilities
│   │   │   ├── generators/
│   │   │   │   ├── presentation-ppt.ts  # Visual presentation PPT
│   │   │   │   ├── shopping-list-ppt.ts # Shopping list PPT
│   │   │   │   ├── budget-ppt.ts        # Budget PPT
│   │   │   │   ├── technical-detailing-ppt.ts # Technical specs PPT
│   │   │   │   ├── budget-excel.ts      # Excel spreadsheet
│   │   │   │   ├── proposal-pdf.ts      # PDF proposal
│   │   │   │   └── proposal-word.ts     # Word proposal
│   │   │   └── index.ts          # Public exports
│   │   ├── dashboard/            # Dashboard module
│   │   │   ├── types.ts          # TypeScript types (DashboardStats, RecentProject, FinanceSummary)
│   │   │   ├── schemas.ts        # Zod validation schemas
│   │   │   ├── services/
│   │   │   │   └── dashboard.service.ts  # Statistics aggregation
│   │   │   └── index.ts          # Public exports
│   │   ├── onboarding/           # Onboarding/Setup wizard module
│   │   │   ├── types.ts          # TypeScript types (SetupWizardState, OfficeConfig, etc.)
│   │   │   ├── schemas.ts        # Zod validation schemas
│   │   │   ├── constants/
│   │   │   │   ├── office-sizes.ts # Office size options
│   │   │   │   ├── roles.ts      # Team role options
│   │   │   │   ├── cost-fields.ts # Cost field definitions
│   │   │   │   ├── services.ts   # Service options
│   │   │   │   └── index.ts      # Constants exports
│   │   │   ├── services/
│   │   │   │   └── onboarding.service.ts # Setup CRUD operations
│   │   │   ├── components/
│   │   │   │   ├── welcome-screen.tsx  # Welcome screen
│   │   │   │   ├── setup-wizard.tsx    # Main wizard container
│   │   │   │   ├── setup-progress.tsx  # Progress indicator
│   │   │   │   └── steps/              # 6 step components
│   │   │   │       ├── step-size.tsx   # Office size selection
│   │   │   │       ├── step-name.tsx   # Office name input
│   │   │   │       ├── step-team.tsx   # Team members form
│   │   │   │       ├── step-costs.tsx  # Fixed costs input
│   │   │   │       ├── step-services.tsx # Services multi-select
│   │   │   │       └── step-margin.tsx # Profit margin slider
│   │   │   ├── hooks/
│   │   │   │   └── use-setup-wizard.ts # Wizard state management
│   │   │   └── index.ts          # Public exports
│   │   └── ai/
│   │
│   ├── shared/                   # Shared code
│   │   ├── components/
│   │   │   ├── ui/               # 26 shadcn/ui components
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

## shadcn/ui Components (27 installed)

```
accordion, alert, alert-dialog, avatar, badge, button, card, checkbox,
collapsible, dialog, dropdown-menu, form, input, label, scroll-area, select,
separator, sheet, sidebar, skeleton, slider, sonner (toast), switch,
table, tabs, textarea, tooltip
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
- [x] shadcn/ui com 26 componentes
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
- [x] Página de perfil `/perfil` com:
  - [x] Visualização e edição de nome completo
  - [x] Upload de foto de perfil (avatar) com integração ao Supabase Storage
  - [x] Configuração de tema (claro/escuro)
  - [x] Configuração de notificações
- [x] API endpoints de perfil:
  - [x] `GET /api/profile` - Buscar perfil do usuário
  - [x] `PUT /api/profile` - Atualizar perfil (nome, settings)
  - [x] `POST /api/profile/avatar` - Upload de avatar
  - [x] `DELETE /api/profile/avatar` - Remover avatar

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
- [x] Página `/projetos` com lista de projetos
- [x] Visualizações: Grade, Lista e Kanban
- [x] Hook `useProjects` para gerenciamento de estado
- [x] Componentes em `src/modules/projects/components/`:
  - `ProjectCard` - Card de projeto com barra de progresso
  - `ProjectModal` - Modal de criar/editar projeto
  - `EmptyState` - Estado vazio
  - `KanbanBoard` - Quadro Kanban com drag-and-drop
  - `KanbanColumn` - Coluna do Kanban
  - `KanbanCard` - Card do Kanban arrastável
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
- [x] Página `/calculadora` com wizard multi-step
- [x] Componentes em `src/modules/calculator/components/`:
  - `CalculatorWizard` - Wizard principal com 4 etapas
  - `StepService` - Seleção do tipo de serviço
  - `StepEnvironments` - Configuração de ambientes
  - `StepArea` - Configuração de área (m²)
  - `StepOptions` - Opções adicionais (modalidade, pagamento)
  - `CalculatorResult` - Exibição do resultado
- [x] Integração com API via `useCalculator` hook
- [x] Componente shadcn/ui `Slider` instalado
- [x] Animações e transições com CSS

### ✅ Fase 4: Orçamentos - Backend (COMPLETA)
- [x] Módulo budgets criado em `src/modules/budgets/`
- [x] Types: Budget, BudgetItem, BudgetCalculation, BudgetDetails, BudgetPaymentTerms
- [x] Types CRUD: BudgetFilters, CreateBudgetData, UpdateBudgetData, BudgetWithClient
- [x] Types Items: AddBudgetItemData, UpdateBudgetItemData
- [x] Schemas Zod: createBudgetSchema, updateBudgetSchema, budgetFiltersSchema
- [x] Schemas Items: addBudgetItemSchema, updateBudgetItemSchema, itemIdSchema
- [x] Constantes: DEFAULT_CALCULATION, DEFAULT_DETAILS, DEFAULT_PAYMENT_TERMS
- [x] Constantes: COMPLEXITY_MULTIPLIERS, FINISH_MULTIPLIERS, EFFICIENCY_THRESHOLDS
- [x] Service CRUD: listBudgets, getBudgetById, createBudget, updateBudget, deleteBudget, countBudgets
- [x] Service Items: addBudgetItem, updateBudgetItem, removeBudgetItem
- [x] Utils: calculateItemTotal, recalculateItemsTotal
- [x] API endpoints:
  - `GET /api/budgets` - Listar com filtros e paginação
  - `POST /api/budgets` - Criar orçamento (auto-gera código PROP-YYNNN)
  - `GET /api/budgets/[id]` - Buscar por ID com cliente
  - `PUT /api/budgets/[id]` - Atualizar orçamento (merge JSONB)
  - `DELETE /api/budgets/[id]` - Deletar orçamento
  - `POST /api/budgets/[id]/items` - Adicionar item
  - `PUT /api/budgets/[id]/items` - Atualizar item (body.id)
  - `DELETE /api/budgets/[id]/items?itemId=` - Remover item
- [x] Items armazenados em `details.items` (JSONB array)
- [x] Recálculo automático de `calculation.items_total`
- [x] Status workflow: draft → sent → approved → rejected
- [x] Testes unitários (55 testes - schemas)

### ✅ Fase 4: Orçamentos - Frontend (COMPLETA)
- [x] Página `/dashboard/orcamentos` com lista de orçamentos
- [x] Página `/dashboard/orcamentos/[id]` com detalhe do orçamento
- [x] Componentes em `src/modules/budgets/components/`:
  - `BudgetCard` - Card de orçamento com status e valor
  - `BudgetDetailHeader` - Cabeçalho com ações (exportar PDF/Excel)
  - `BudgetValueCard` - Card de valor total
  - `ItemsTable` - Tabela de itens com edição inline
  - `CategorySummary` - Resumo por categoria
  - `AddEditItemModal` - Modal de adicionar/editar item
  - `StatusFilter` - Filtro por status
  - `BudgetsEmptyState` - Estado vazio
  - `BudgetsSkeleton` / `BudgetDetailSkeleton` - Loading states
- [x] Hooks em `src/modules/budgets/hooks/`:
  - `useBudgets` - Lista com filtros e busca
  - `useBudget` - CRUD de orçamento individual
- [x] Exportação PDF/Excel integrada

### ✅ Fase 5: Apresentações - Backend (COMPLETA)
- [x] Módulo presentations criado em `src/modules/presentations/`
- [x] Types: Presentation, PresentationImage, PresentationItem
- [x] Types: ImageSection, ItemCategory, ItemType, ClientData, ProductDetails
- [x] Constantes: IMAGE_SECTION_LIMITS (photos_before:4, moodboard:1, references:6, floor_plan:1, renders:10)
- [x] Constantes: CATEGORY_CONFIGS (12 categorias com cores)
- [x] Service CRUD: createPresentation, getPresentationById, updatePresentation, deletePresentation, listPresentations
- [x] Service Images: uploadImage, deleteImage, updateImageOrder, getAllImages, getImagesBySection, isSectionFull
- [x] Service Items: addItem, updateItem, deleteItem, getItems, getLayoutItems, getComplementaryItems, addBulkItems
- [x] API endpoints:
  - `GET /api/presentations` - Listar apresentações
  - `POST /api/presentations` - Criar apresentação
  - `GET /api/presentations/[id]` - Buscar por ID
  - `PUT /api/presentations/[id]` - Atualizar apresentação
  - `DELETE /api/presentations/[id]` - Deletar apresentação
  - `POST /api/presentations/[id]/images` - Upload de imagem
  - `GET /api/presentations/[id]/images` - Listar imagens por seção
  - `PATCH /api/presentations/[id]/images` - Reordenar imagens
  - `DELETE /api/presentations/[id]/images/[imageId]` - Deletar imagem
  - `POST /api/presentations/[id]/items` - Adicionar item (single ou bulk)
  - `GET /api/presentations/[id]/items` - Listar itens com filtros
  - `PATCH /api/presentations/[id]/items/[itemId]` - Atualizar item
  - `PUT /api/presentations/[id]/items/[itemId]` - Atualizar posição
  - `DELETE /api/presentations/[id]/items/[itemId]` - Deletar item

### ✅ Fase 5: Apresentações - Frontend (COMPLETA)
- [x] Página `/dashboard/apresentacoes` com lista de apresentações
- [x] Página `/dashboard/apresentacoes/[id]` com 6 abas
- [x] Componentes em `src/modules/presentations/components/`:
  - `PresentationCard` - Card de apresentação
  - `NewPresentationModal` - Modal de criar apresentação
  - `PresentationsFilters` - Filtros e busca
  - `PresentationsEmpty` - Estado vazio
  - `PresentationsSkeleton` - Loading state
- [x] Tabs em `src/modules/presentations/components/tabs/`:
  - `TabImagens` - Upload de imagens por seção (fotos, moodboard, referências, planta, renders)
  - `TabLayout` - Editor de planta baixa com marcadores
  - `TabCompras` - Lista de compras com filtros e exportação
  - `TabDetalhamento` - Detalhamento técnico por categoria
  - `TabOrcamento` - Orçamento com totais e edição inline
  - `TabExportar` - Checklist e exportação de documentos
- [x] Hook `usePresentations` para gerenciamento de estado
- [x] Constantes em `constants.ts` (categorias, cores, limites)

### ✅ Fase 6: Documentos - Backend (COMPLETA)
- [x] Módulo documents criado em `src/modules/documents/`
- [x] Types: PresentationPPTInput, ShoppingListPPTInput, BudgetPPTInput, TechnicalDetailingPPTInput
- [x] Types: ExcelBudgetInput, PDFProposalInput, WordProposalInput, GenerationResult
- [x] Constantes: PPT_CONSTANTS (slide 3:2 ratio - 10x6.67 inches), CATEGORY_COLORS
- [x] Utils: pptx-helpers.ts (createPresentation, createCoverSlide, createSectionSlide, imageUrlToBase64, etc.)
- [x] Generators:
  - `presentation-ppt.ts` - PPT visual com cover, fotos, moodboard, referências, planta, renders
  - `shopping-list-ppt.ts` - PPT lista de compras com cards de itens
  - `budget-ppt.ts` - PPT orçamento com resumo por categoria e tabelas
  - `technical-detailing-ppt.ts` - PPT detalhamento técnico por ambiente
  - `budget-excel.ts` - Planilha Excel formatada com fórmulas
  - `proposal-pdf.ts` - Proposta comercial em PDF (jsPDF)
  - `proposal-word.ts` - Proposta comercial em Word (docx)
- [x] API endpoints:
  - `POST /api/documents/presentations/[id]/ppt` - Gerar PPT de apresentação
  - `POST /api/documents/presentations/[id]/shopping-list` - Gerar PPT lista de compras
  - `POST /api/documents/presentations/[id]/budget` - Gerar PPT ou Excel de orçamento
  - `POST /api/documents/presentations/[id]/detailing` - Gerar PPT detalhamento
  - `POST /api/documents/proposals` - Gerar proposta PDF ou Word

### ✅ Fase 6: Documentos - Frontend (COMPLETA)
- [x] Integração em `/dashboard/orcamentos/[id]` - Botões exportar PDF/Excel
- [x] Integração em `/dashboard/apresentacoes/[id]` - Aba Exportar com:
  - Checklist de completude do projeto
  - Seleção de documentos para exportar
  - Preview dos slides
  - Botão gerar todos os documentos
- [x] Toast notifications para feedback de download
- [x] Loading states durante geração

### ✅ Fase 7: AI - Backend (COMPLETA)
- [x] Módulo ai criado em `src/modules/ai/`
- [x] Types: BriefingResult, BrandbookResult, ProductExtractionResult
- [x] Types: AIError, AIRequestOptions
- [x] Schemas Zod: briefingInputSchema, brandbookInputSchema, productExtractionSchema
- [x] Prompts em `src/modules/ai/prompts/`:
  - `briefing.ts` - Prompts para memorial, moodboard, referências
  - `brandbook.ts` - Prompt para brandbook completo
  - `product-extraction.ts` - Prompt para extrair dados de produtos
- [x] Services em `src/modules/ai/services/`:
  - `briefing.service.ts` - Geração de briefing com IA
  - `brandbook.service.ts` - Geração de brandbook com IA
  - `product-extraction.service.ts` - Extração de dados de produtos
- [x] API endpoints:
  - `POST /api/ai/briefing` - Gerar memorial/moodboard/referência
  - `POST /api/ai/brandbook` - Gerar brandbook completo
  - `POST /api/ai/extract-product` - Extrair dados de link de produto
- [x] Integração com OpenRouter (`src/shared/lib/openrouter.ts`)
- [x] Testes unitários (73 testes - schemas + services)

### ✅ Fase 7: AI - Frontend (COMPLETA)
- [x] Página `/dashboard/brandbook` com wizard completo
- [x] Componentes em `src/modules/ai/components/`:
  - `BriefingAIModal` - Modal de briefing com IA
  - `BriefingTabMemorial` - Aba de memorial
  - `BriefingTabMoodboard` - Aba de moodboard
  - `BriefingTabReference` - Aba de referências
  - `BrandbookWizard` - Wizard de brandbook em etapas
  - `BrandbookStepIndicator` - Indicador de progresso
  - `BrandbookQuestionField` - Campo de pergunta
  - `BrandbookResultView` - Visualização do resultado
  - `ProductLinkInput` - Input com extração automática
- [x] Hooks em `src/modules/ai/hooks/`:
  - `useBriefing` - Geração de briefing
  - `useBrandbook` - Geração de brandbook
  - `useProductExtraction` - Extração de dados de produtos
- [x] Constantes em `constants/brandbook-questions.ts` (7 blocos de perguntas)
- [x] Testes de hooks (387 testes)

### ✅ Fase 8: Dashboard - Backend (COMPLETA)
- [x] Módulo dashboard criado em `src/modules/dashboard/`
- [x] Types: DashboardStats, ProjectStats, BudgetStats, PresentationStats, HoursStats
- [x] Types: RecentProject, FinanceSummary, IncomeBreakdown, ExpensesBreakdown
- [x] Types: DashboardResult, API response types
- [x] Schemas Zod: financeSummaryParamsSchema, recentProjectsParamsSchema
- [x] Service: getDashboardStats (agregação de estatísticas de projects, budgets, presentations, hours)
- [x] Service: getRecentProjects (últimos projetos atualizados com cliente)
- [x] Service: getFinanceSummary (receitas, despesas, balanço por período)
- [x] API endpoints:
  - `GET /api/dashboard/stats` - Estatísticas combinadas do dashboard
  - `GET /api/dashboard/projects/recent` - Projetos recentes (limit param)
  - `GET /api/dashboard/finance/summary` - Resumo financeiro (startDate, endDate params)
- [x] Estatísticas calculadas:
  - Projetos: total, por status, por tipo de serviço, ativos, concluídos no mês
  - Orçamentos: total, por status, taxa de aprovação, valor médio, valor pendente
  - Apresentações: total, por status, em progresso
  - Horas: total do mês, top 10 projetos por horas
  - Finanças: receitas (por categoria, pago/pendente/vencido), despesas, balanço
- [x] Testes unitários (51 testes - schemas + api)

### ✅ Fase 8: Dashboard - Frontend (COMPLETA)
- [x] Página `/dashboard` com estatísticas e ações rápidas
- [x] Página `/dashboard/financeiro` com resumo financeiro
- [x] Componentes em `src/modules/dashboard/components/`:
  - `MetricCard` - Card de métrica com ícone
  - `FinanceCard` - Card financeiro colorido
  - `ActiveProjects` - Lista de projetos ativos
  - `RecentBudgets` - Orçamentos recentes
  - `QuickActions` - Ações rápidas
  - `DashboardSkeleton` - Loading state
- [x] Componentes em `src/modules/finance/components/`:
  - `FinanceSummaryCards` - 5 cards de resumo
  - `FinanceChart` - Gráfico de receitas (recharts)
  - `FinancePeriodFilter` - Filtro por período
  - `FinanceProjectsTable` - Tabela de receitas por projeto
  - `FinanceCategoryBreakdown` - Breakdown por categoria
  - `FinanceSkeleton` - Loading state
- [x] Hook `useDashboard` para estatísticas
- [x] Hook `useFinanceSummary` para financeiro
- [x] Testes E2E (`dashboard.spec.ts` - 14 testes)

### ✅ Onboarding: Welcome Screen + Setup Wizard (COMPLETA)
- [x] Módulo onboarding criado em `src/modules/onboarding/`
- [x] Types: SetupWizardState, OfficeConfig, OfficeCosts, TeamMemberData, etc.
- [x] Schemas Zod: stepSizeSchema, stepNameSchema, stepTeamSchema, stepCostsSchema, stepServicesSchema, stepMarginSchema, completeSetupSchema
- [x] Constantes:
  - `office-sizes.ts` - 4 opções (solo, pequeno, médio, grande)
  - `roles.ts` - 5 cargos com valores padrão (sócio, coordenador, arquiteto, estagiário, administrativo)
  - `cost-fields.ts` - 7 campos de custo (aluguel, contas, software, marketing, contador, internet, outros)
  - `services.ts` - 4 serviços (decorexpress, projetexpress, produção, consultoria)
- [x] Service: getSetupStatus, updateSetupStep, skipSetup, completeSetup, getOrganizationConfig
- [x] API endpoints:
  - `GET /api/onboarding/status` - Status do setup
  - `PUT /api/onboarding/status` - Atualizar step atual
  - `DELETE /api/onboarding/status` - Pular setup
  - `POST /api/onboarding/complete` - Completar setup
- [x] Páginas:
  - `/welcome` - Tela de boas-vindas
  - `/setup` - Wizard de configuração
- [x] Componentes:
  - `WelcomeScreen` - Tela inicial com botões "Começar" e "Pular"
  - `SetupWizard` - Container do wizard com navegação
  - `SetupProgress` - Indicador de progresso (desktop/mobile)
  - `StepSize` - Seleção de tamanho do escritório (grid de cards)
  - `StepName` - Input do nome do escritório
  - `StepTeam` - Formulário de membros da equipe
  - `StepCosts` - Grid de inputs de custos fixos
  - `StepServices` - Multi-select de serviços
  - `StepMargin` - Slider de margem de lucro com preview
- [x] Hook `useSetupWizard` - Estado do wizard com localStorage persistence
- [x] Middleware atualizado para redirect para /welcome se setup não completado
- [x] Auth context atualizado com organization e hasCompletedSetup
- [x] Dados salvos em `organizations.settings`:
  ```json
  {
    "setup_completed_at": "2026-01-21T10:00:00Z",
    "setup_step": 6,
    "office": {
      "size": "medium",
      "margin": 30,
      "services": ["decorexpress", "producao"],
      "costs": { "rent": 3000, "utilities": 500, ... }
    }
  }
  ```

### 🔲 Fase 9: Deploy
Ver `TODO.md` para detalhes completos (Polish UX, Performance, Deploy, Documentação).

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

**Última atualização:** 2026-01-21 (Fases 0-8 + Onboarding completas - Backend + Frontend)
