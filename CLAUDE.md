# CLAUDE.md - ArqOS Development Guidelines

<DEVCORE>
## Development Principles

### Core Philosophy
100% signal, 0% noise. Every action must move the needle.

### Before Coding
- NEVER start without full context - ASK about stack, patterns, existing code
- If no PRD exists, request or create one first

### Coding Standards
- Clean, readable, self-documenting code
- No over-engineering - solve current problem only
- TDD: write tests first, then implement
- Follow existing nomenclature and folder structures
- Check existing code before creating new patterns

### Implementation Order (Vertical Slices)
1. Schema/Database → 2. Backend/API → 3. Frontend → 4. Tests
**NEVER build all backend first, then all frontend.**

### During/After Implementation
- Validate: security, return types, error handling, schema consistency
- If context incomplete, ASK before assuming
- Update CLAUDE.md with new implementations
</DEVCORE>

---

## Project Overview

**ArqOS** - Sistema unificado para escritórios de arquitetura e design de interiores.

Legacy repos (reference in `/legacy/`): arqflow-ai, manual-de-apreenta-o, remix-of-budget-buddy

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15.5.9 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 + shadcn/ui |
| State | TanStack Query + Context |
| Forms | React Hook Form + Zod |
| Backend | Supabase (SSR) |
| AI | OpenRouter (Claude, GPT, Gemini) |
| Docs | pptxgenjs, xlsx, jsPDF, docx |
| Testing | Vitest + Playwright |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, cadastro (public)
│   ├── (dashboard)/     # Protected routes with sidebar
│   │   ├── dashboard/   # Home with stats
│   │   ├── projetos/    # Projects + Kanban
│   │   ├── orcamentos/  # Budgets
│   │   ├── apresentacoes/ # Presentations
│   │   ├── financeiro/  # Finance + Expenses
│   │   ├── perfil/      # Profile
│   │   └── configuracoes/ # Settings
│   ├── (onboarding)/    # Welcome + Setup wizard
│   └── api/             # API routes (see below)
│
├── modules/             # Feature modules (DDD)
│   ├── auth/           # Context, hooks, schemas
│   ├── projects/       # CRUD + Kanban + components
│   ├── budgets/        # CRUD + items management
│   ├── presentations/  # Images + items + tabs
│   ├── calculator/     # Pricing engine + wizard
│   ├── documents/      # PPT, Excel, PDF, Word generators
│   ├── dashboard/      # Stats aggregation
│   ├── finance/        # Expenses CRUD
│   ├── onboarding/     # Setup wizard (6 steps)
│   ├── settings/       # Office configuration
│   └── ai/             # Briefing, brandbook, product extraction
│
└── shared/
    ├── components/ui/  # 27 shadcn/ui components
    └── lib/supabase/   # Client, server, middleware
```

**Module pattern:** Each module has `types.ts`, `schemas.ts`, `services/`, `hooks/`, `components/`, `index.ts`

---

## API Endpoints

### Projects `/api/projects`
- `GET/POST /` - List/Create
- `GET/PUT/DELETE /[id]` - CRUD
- `POST /[id]/stage` - Move stage
- `GET /[id]/stages` - Workflow stages
- `POST /[id]/time-entry` - Log hours
- `GET /[id]/timeline` - Timeline

### Budgets `/api/budgets`
- `GET/POST /` - List/Create (auto-code PROP-YYNNN)
- `GET/PUT/DELETE /[id]` - CRUD
- `POST/PUT/DELETE /[id]/items` - Items management

### Presentations `/api/presentations`
- `GET/POST /` - List/Create
- `GET/PUT/DELETE /[id]` - CRUD
- `POST/GET/PATCH /[id]/images` - Image management
- `DELETE /[id]/images/[imageId]`
- `POST/GET /[id]/items` - Items
- `PATCH/PUT/DELETE /[id]/items/[itemId]`

### Documents `/api/documents`
- `POST /presentations/[id]/ppt` - Visual PPT
- `POST /presentations/[id]/shopping-list` - Shopping list PPT
- `POST /presentations/[id]/budget` - Budget PPT/Excel
- `POST /presentations/[id]/detailing` - Technical PPT
- `POST /proposals` - PDF/Word proposals

### AI `/api/ai`
- `POST /briefing` - Generate memorial/moodboard
- `POST /brandbook` - Generate brandbook
- `POST /extract-product` - Extract product data from URL

### Other
- `GET/PUT /api/profile` + `/avatar`
- `GET /api/dashboard/stats`, `/projects/recent`, `/finance/summary`
- `GET/POST/PUT/DELETE /api/finance/expenses`
- `GET/PUT/DELETE /api/onboarding/status`, `POST /complete`
- `PUT /api/organization` + `/team` CRUD

---

## Database (Supabase)

### Tables (13)
`organizations`, `profiles`, `clients`, `budgets`, `projects`, `time_entries`, `project_items`, `finance_records`, `lookup_data`, `activity_log`, `presentations`, `presentation_images`, `presentation_items`

### Storage Buckets
`avatars` (public), `project-images`, `project-files`, `proposals`, `presentation-images` (private)

### Key Features
- RLS multi-tenant isolation by `organization_id`
- Auto-generated codes: PROP-YYNNN, ARQ-YYNNN, APRES-YYNNN
- Triggers: auto `updated_at`, client snapshots, activity logging
- Image limits: photos_before(4), moodboard(1), references(6), floor_plan(1), renders(10)

---

## AI Models (OpenRouter)

| Feature | Model |
|---------|-------|
| Briefing/Brandbook | `anthropic/claude-3.5-sonnet` |
| Image prompts | `openai/gpt-4o` |
| Floor plan | `google/gemini-2.0-flash-exp` |

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENROUTER_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Commands

```bash
# Dev
npm run dev

# Build
npm run build && npm run start

# Test
npm run test              # Unit (watch)
npm run test:run          # Unit (single)
npm run test:coverage
npm run test:e2e          # Playwright

# Database
npx supabase db push
npx supabase gen types typescript --local > src/shared/lib/supabase/database.types.ts

# UI
npx shadcn@latest add [component]
```

---

## Implementation Status

**Fases 0-8 COMPLETAS:** Setup, Auth, Projects (Kanban), Calculator, Budgets, Presentations, Documents, AI, Dashboard, Onboarding, Settings, Finance/Expenses.

**Pendente:** Fase 9 - Deploy (ver TODO.md)

---

## Related Files

- `TODO.md` - Remaining tasks
- `supabase/migrations/` - Database schema
- `legacy/` - Original repos for reference
