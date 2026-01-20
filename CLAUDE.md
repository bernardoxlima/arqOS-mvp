# CLAUDE.md - Project Context & Development Guidelines

## Project Overview

**ArqExpress** - Sistema unificado para escritórios de arquitetura e design de interiores.

Unificação de 3 repositórios:
- `arqflow-ai` - Gestão de projetos, AI (briefing, brandbook), calculadora
- `manual-de-apreenta-o-arqexpress-duplicado-v2` - Apresentações, upload de imagens, geração PPTX/Excel
- `remix-of-budget-buddy` - Orçamentação, Kanban, geração PDF/Word

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16.1.4 (App Router) |
| **Language** | TypeScript (strict) |
| **Styling** | Tailwind CSS 4.0 |
| **UI Components** | shadcn/ui + Radix UI |
| **State Management** | TanStack React Query + Context |
| **Forms** | React Hook Form + Zod |
| **Database/Auth** | Supabase (SSR) |
| **AI Provider** | OpenRouter (Claude, GPT, Gemini) |
| **Document Generation** | pptxgenjs, xlsx, jsPDF, docx |
| **Testing** | Vitest + Testing Library + Playwright |

---

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

---

## Project Structure

```
arqexpress/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth routes (login, register)
│   │   ├── (dashboard)/        # Protected routes
│   │   │   ├── projetos/
│   │   │   ├── orcamentos/
│   │   │   ├── apresentacoes/
│   │   │   └── financeiro/
│   │   └── api/                # API Routes
│   │       ├── ai/             # OpenRouter integrations
│   │       └── documents/      # PDF, PPTX, Excel generation
│   │
│   ├── modules/                # Feature modules (DDD-like)
│   │   ├── budgets/
│   │   ├── projects/
│   │   ├── presentations/
│   │   ├── calculator/
│   │   ├── documents/
│   │   └── ai/
│   │
│   └── shared/                 # Shared code
│       ├── components/ui/      # shadcn/ui components
│       ├── hooks/
│       ├── lib/
│       │   ├── supabase/
│       │   ├── openrouter.ts
│       │   └── utils.ts
│       ├── types/
│       └── constants/
│
├── supabase/
│   ├── migrations/
│   └── functions/
│
└── __tests__/
    ├── e2e/
    └── integration/
```

---

## AI Integration (OpenRouter)

```typescript
// src/shared/lib/openrouter.ts
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

## Current Features Status

### Working (from original repos)
- Auth with Supabase (manual-apresentacao)
- AI Briefing & Brandbook generation (arqflow-ai)
- PPTX generation - 4 types (manual-apresentacao)
- Excel budget export (manual-apresentacao)
- PDF proposal generation (remix-budget-buddy)
- Word proposal generation (remix-budget-buddy)
- Pricing calculator (arqflow-ai, remix-budget-buddy)

### To Implement
- Unified Supabase schema for all modules
- Persistent Kanban (currently localStorage only)
- Real-time collaboration
- Project versioning

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
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenRouter
OPENROUTER_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Useful Commands

```bash
# Development
npm run dev

# Testing
npm run test          # Unit tests
npm run test:e2e      # E2E tests
npm run test:coverage # Coverage report

# Database
npx supabase db push
npx supabase gen types typescript --local > src/shared/lib/supabase/database.types.ts

# UI Components
npx shadcn@latest add [component]
```

---

## Related Files

- `PLANO_UNIFICACAO_NEXTJS.md` - Full migration plan
- `supabase/migrations/` - Database schema
- `src/shared/lib/supabase/` - Supabase client config
