# 📋 PLANO DE UNIFICAÇÃO - NEXT.JS 16.1.4 FULL STACK + TDD

## 🎯 Visão Geral dos Repositórios Atuais

| Projeto | Foco | Saídas |
|---------|------|--------|
| **arqflow-ai** | Gestão de projetos, AI, Kanban, Dashboard | Supabase Functions |
| **manual-apresentacao** | Upload de imagens, Layout de planta | PowerPoint + Excel |
| **remix-budget-buddy** | Calculadora de preços, Kanban | PDF + Word |

Todos já usam: React, TypeScript, Tailwind, shadcn/ui, Supabase.

---

## 🏗️ ARQUITETURA PROPOSTA

```
arqexpress/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx            # Layout com sidebar
│   │   │   ├── page.tsx              # Dashboard principal
│   │   │   ├── projetos/
│   │   │   │   ├── page.tsx          # Kanban de projetos
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Detalhe do projeto
│   │   │   ├── orcamentos/
│   │   │   │   ├── page.tsx          # Lista de orçamentos
│   │   │   │   ├── novo/
│   │   │   │   │   └── page.tsx      # Calculadora
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Detalhe orçamento
│   │   │   ├── apresentacoes/
│   │   │   │   ├── page.tsx          # Lista apresentações
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── imagens/
│   │   │   │       ├── layout-planta/
│   │   │   │       └── exportar/
│   │   │   ├── financeiro/
│   │   │   └── configuracoes/
│   │   ├── api/                       # API Routes (Server)
│   │   │   ├── ai/
│   │   │   │   ├── briefing/route.ts
│   │   │   │   └── brand-architecture/route.ts
│   │   │   ├── documents/
│   │   │   │   ├── pptx/route.ts
│   │   │   │   ├── excel/route.ts
│   │   │   │   ├── pdf/route.ts
│   │   │   │   └── docx/route.ts
│   │   │   ├── budgets/
│   │   │   ├── projects/
│   │   │   └── webhooks/
│   │   └── layout.tsx
│   │
│   ├── modules/                       # Feature Modules (DDD-like)
│   │   ├── budgets/                   # Módulo de Orçamentos
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   └── __tests__/
│   │   │
│   │   ├── projects/                  # Módulo de Projetos
│   │   │   ├── components/
│   │   │   │   ├── ProjectKanban/
│   │   │   │   ├── ProjectModal/
│   │   │   │   └── ProjectTimeline/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── __tests__/
│   │   │
│   │   ├── presentations/             # Módulo de Apresentações
│   │   │   ├── components/
│   │   │   │   ├── ImageUploadZone/
│   │   │   │   ├── FloorPlanEditor/
│   │   │   │   └── SlidePreview/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── __tests__/
│   │   │
│   │   ├── calculator/                # Módulo Calculadora
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   │   └── pricing-engine.ts  # Lógica de cálculo
│   │   │   └── __tests__/
│   │   │       └── pricing-engine.test.ts
│   │   │
│   │   ├── documents/                 # Módulo de Geração de Docs
│   │   │   ├── generators/
│   │   │   │   ├── pptx-generator.ts
│   │   │   │   ├── excel-generator.ts
│   │   │   │   ├── pdf-generator.ts
│   │   │   │   └── docx-generator.ts
│   │   │   └── __tests__/
│   │   │
│   │   └── ai/                        # Módulo AI
│   │       ├── services/
│   │       └── __tests__/
│   │
│   ├── shared/                        # Código Compartilhado
│   │   ├── components/
│   │   │   └── ui/                    # shadcn/ui components
│   │   ├── hooks/
│   │   │   ├── use-mobile.ts
│   │   │   ├── use-toast.ts
│   │   │   └── use-local-storage.ts
│   │   ├── lib/
│   │   │   ├── supabase/
│   │   │   │   ├── client.ts
│   │   │   │   ├── server.ts
│   │   │   │   └── middleware.ts
│   │   │   ├── utils.ts
│   │   │   └── validations.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── constants/
│   │       ├── categories.ts
│   │       ├── environments.ts
│   │       └── pricing-data.ts
│   │
│   └── __tests__/                     # Testes E2E
│       ├── e2e/
│       └── integration/
│
├── supabase/
│   ├── migrations/
│   ├── functions/
│   └── seed.sql
│
├── public/
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
└── .env.local
```

---

## 🧪 ESTRATÉGIA TDD

```
Pirâmide de Testes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        ╱╲
       ╱  ╲        E2E (Playwright)
      ╱────╲       → Fluxos críticos: Login → Criar Orçamento → Gerar PDF
     ╱      ╲
    ╱────────╲     Integration (Vitest + Testing Library)
   ╱          ╲    → API Routes, Hooks com Supabase
  ╱────────────╲
 ╱              ╲  Unit (Vitest)
╱────────────────╲ → pricing-engine, generators, utils
```

### Ferramentas

- **Vitest** - Unit & Integration tests (rápido, compatível com Vite)
- **Testing Library** - Testes de componentes React
- **Playwright** - E2E tests
- **MSW** - Mock de API para testes

### Cobertura Mínima

80% nos modules/

---

## 📦 DEPENDÊNCIAS PRINCIPAIS

```json
{
  "dependencies": {
    "next": "16.1.4",
    "react": "^19.0.0",
    "typescript": "^5.7.0",
    "tailwindcss": "^4.0.0",
    "@supabase/supabase-js": "^2.x",
    "@supabase/ssr": "^0.x",
    "@tanstack/react-query": "^5.x",
    "zod": "^3.x",
    "react-hook-form": "^7.x",

    "pptxgenjs": "^3.x",
    "xlsx": "^0.x",
    "jspdf": "^2.x",
    "docx": "^8.x",

    "framer-motion": "^11.x",
    "lucide-react": "^0.x",
    "recharts": "^2.x",

    "openai": "^4.x",

    "@radix-ui/react-*": "^1.x",
    "class-variance-authority": "^0.7.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x",
    "tailwindcss-animate": "^1.x"
  },
  "devDependencies": {
    "vitest": "^2.x",
    "@testing-library/react": "^16.x",
    "@playwright/test": "^1.x",
    "msw": "^2.x"
  }
}
```

---

## 🎨 UI - SHADCN/UI

**Biblioteca:** [shadcn/ui](https://ui.shadcn.com) (componentes copiáveis baseados em Radix UI + Tailwind)

### Inicialização

```bash
npx shadcn@latest init
```

### Configuração (components.json)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/shared/components",
    "utils": "@/shared/lib/utils",
    "ui": "@/shared/components/ui",
    "lib": "@/shared/lib",
    "hooks": "@/shared/hooks"
  }
}
```

### Componentes a Instalar

```bash
# Componentes essenciais (já usados nos 3 projetos)
npx shadcn@latest add button card dialog dropdown-menu input label \
  select tabs toast sidebar sheet accordion avatar badge calendar \
  checkbox command form popover progress scroll-area separator \
  skeleton slider switch table textarea tooltip
```

### Estrutura dos Componentes UI

```
src/shared/components/ui/
├── button.tsx
├── card.tsx
├── dialog.tsx
├── dropdown-menu.tsx
├── form.tsx
├── input.tsx
├── select.tsx
├── sidebar.tsx
├── tabs.tsx
├── toast.tsx
├── toaster.tsx
└── ... (40+ componentes)
```

---

## 🤖 INTEGRAÇÃO AI - OPENROUTER

**Provider:** [OpenRouter](https://openrouter.ai) (acesso a múltiplos modelos via API única)

### Configuração

```typescript
// src/shared/lib/openrouter.ts
import OpenAI from 'openai';

export const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL,
    'X-Title': 'ArqExpress',
  },
});
```

### Modelos Recomendados

| Funcionalidade | Modelo Sugerido | Uso |
|----------------|-----------------|-----|
| Briefing/Texto | `anthropic/claude-3.5-sonnet` | Geração de documentos estruturados |
| Brandbook | `anthropic/claude-3.5-sonnet` | Conteúdo criativo/estratégico |
| Moodboard Prompts | `openai/gpt-4o` | Geração de prompts para imagens |
| Anotação de Planta | `google/gemini-2.0-flash-exp` | Análise de imagens (multimodal) |

### Variáveis de Ambiente

```env
# .env.local
OPENROUTER_API_KEY=sk-or-v1-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Estrutura das API Routes de AI

```
src/app/api/ai/
├── briefing/
│   └── route.ts          # POST - Gera memorial de briefing
├── brand-architecture/
│   └── route.ts          # POST - Gera brandbook
├── moodboard-prompt/
│   └── route.ts          # POST - Gera prompt para moodboard
├── reference-prompt/
│   └── route.ts          # POST - Gera prompt para render 3D
└── annotate-floor-plan/
    └── route.ts          # POST - Anota planta baixa (multimodal)
```

---

## 🔄 FASES DE MIGRAÇÃO

| Fase | Descrição | Prioridade |
|------|-----------|------------|
| **1** | Setup Next.js 16.1.4 + Tailwind + Supabase + estrutura base | Alta |
| **2** | Migrar `shared/` (UI components, hooks, utils) | Alta |
| **3** | Migrar módulo `calculator/` com TDD | Alta |
| **4** | Migrar módulo `budgets/` | Alta |
| **5** | Migrar módulo `projects/` (Kanban) | Média |
| **6** | Migrar módulo `presentations/` (upload, layout) | Média |
| **7** | Migrar módulo `documents/` (geradores) | Média |
| **8** | Migrar módulo `ai/` (Supabase Functions → API Routes) | Baixa |
| **9** | Testes E2E + Deploy | Alta |

---

## 💡 DECISÕES ARQUITETURAIS

1. **App Router** ao invés de Pages Router (mais moderno, Server Components)
2. **Módulos por feature** (DDD-like) ao invés de pastas por tipo
3. **Server Actions** para mutações simples, **API Routes** para lógica complexa
4. **Supabase SSR** para autenticação server-side
5. **Geração de docs no servidor** (API Routes) para melhor performance
6. **React Query** para cache client-side, Server Components para dados estáticos

---

## ✅ BENEFÍCIOS DESTA ESTRUTURA

- **Escalável**: Cada módulo é independente e testável
- **Manutenível**: Código organizado por domínio
- **Testável**: TDD desde o início com cobertura clara
- **Performance**: Server Components + Edge Functions
- **Type-safe**: TypeScript strict em todo o projeto

---

## 📊 ANÁLISE DOS REPOSITÓRIOS ORIGINAIS

### 1. arqflow-ai
- **Tecnologias**: React 18, Vite, Tailwind, shadcn/ui, Supabase, TanStack Query
- **Features**: Dashboard, Wizard Setup, Calculadora, Kanban, Financeiro, Templates, AI (Briefing)
- **Tipo**: Frontend SPA com BaaS

### 2. manual-de-apreenta-o-arqexpress-duplicado-v2
- **Tecnologias**: React 18, Vite, Tailwind, shadcn/ui, Supabase
- **Features**: Upload de imagens, Editor de Layout/Planta, Geração PPTX/Excel
- **Tipo**: Frontend SPA com geração de documentos

### 3. remix-of-budget-buddy
- **Tecnologias**: React 18, Vite, Tailwind, shadcn/ui, Supabase, Recharts
- **Features**: Calculadora de preços, Sistema de projetos, Kanban, Geração PDF/Word
- **Tipo**: Frontend SPA com sistema integrado

### Stack Comum
- React 18.3.1 + TypeScript
- Vite 5.4.19
- Tailwind CSS 3.4.17
- shadcn/ui + Radix UI
- React Router v6
- Supabase
- Framer Motion
- Lucide React
