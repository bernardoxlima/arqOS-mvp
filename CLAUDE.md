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
│   │   │   └── financeiro/
│   │   ├── api/                  # API Routes
│   │   │   ├── auth/callback/    # Auth callback route
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
│   │   ├── projects/
│   │   ├── presentations/
│   │   ├── calculator/
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

## shadcn/ui Components (23 installed)

```
accordion, alert-dialog, avatar, badge, button, card, checkbox,
dialog, dropdown-menu, form, input, label, scroll-area, select,
separator, sheet, sidebar, skeleton, sonner (toast), table, tabs,
textarea, tooltip
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

### 🔲 Fases 2-9
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

**Última atualização:** 2026-01-20
