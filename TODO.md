# TODO - ArqOS MVP

> **Princípio:** Vertical Slices - Para cada feature: Schema → Backend → Frontend → Tests
>
> **NUNCA** construir todo backend primeiro, depois todo frontend.

---

## FASE 0: SETUP INICIAL

### 0.1 Projeto Base
- [ ] Criar projeto Next.js 16.1.4 com TypeScript
- [ ] Configurar Tailwind CSS 4.0
- [ ] Configurar ESLint + Prettier
- [ ] Configurar path aliases (`@/`)
- [ ] Criar estrutura de pastas conforme CLAUDE.md

### 0.2 Dependências Core
- [ ] Instalar e configurar shadcn/ui
- [ ] Instalar componentes UI essenciais (button, card, dialog, form, etc.)
- [ ] Configurar Supabase client (SSR)
- [ ] Configurar OpenRouter client
- [ ] Instalar bibliotecas de documentos (pptxgenjs, xlsx, jspdf, docx)

### 0.3 Testing Setup
- [ ] Configurar Vitest
- [ ] Configurar Testing Library
- [ ] Configurar Playwright
- [ ] Criar scripts npm (test, test:e2e, test:coverage)

### 0.4 Environment
- [ ] Criar `.env.example` com todas variáveis
- [ ] Configurar `.env.local`
- [ ] Documentar variáveis no README

---

## FASE 1: AUTENTICAÇÃO (Vertical Slice)

### 1.1 Schema/Database
- [ ] Criar migration: tabela `profiles` (id, user_id, full_name, email, role, avatar_url)
- [ ] Criar RLS policies para profiles
- [ ] Testar migration localmente

### 1.2 Backend/API
- [ ] Criar `src/shared/lib/supabase/server.ts` (server client)
- [ ] Criar `src/shared/lib/supabase/client.ts` (browser client)
- [ ] Criar `src/shared/lib/supabase/middleware.ts` (auth middleware)
- [ ] Criar API route `POST /api/auth/callback`

### 1.3 Frontend
- [ ] Criar página `/login` com form (email, password)
- [ ] Criar página `/register` com form (name, email, password)
- [ ] Criar AuthContext com session management
- [ ] Criar componente `AuthGuard` para rotas protegidas
- [ ] Criar layout `(auth)` para páginas públicas
- [ ] Criar layout `(dashboard)` para páginas protegidas

### 1.4 Tests
- [ ] Unit: validação de forms (Zod schemas)
- [ ] Integration: AuthContext + Supabase mock
- [ ] E2E: fluxo completo login → dashboard

---

## FASE 2: MÓDULO PROJETOS (Vertical Slice)

### 2.1 Schema/Database
- [ ] Criar migration: tabela `projects`
  - id, name, client_name, status, phase, created_by, created_at, updated_at
- [ ] Criar migration: tabela `project_stages` (Kanban)
  - id, project_id, stage_name, order, hours_spent, completed_at
- [ ] Criar RLS policies
- [ ] Criar índices para queries comuns

### 2.2 Backend/API
- [ ] Criar `src/modules/projects/services/project-service.ts`
- [ ] API route `GET /api/projects` (list com filtros)
- [ ] API route `POST /api/projects` (create)
- [ ] API route `GET /api/projects/[id]` (detail)
- [ ] API route `PATCH /api/projects/[id]` (update)
- [ ] API route `DELETE /api/projects/[id]` (delete)
- [ ] API route `PATCH /api/projects/[id]/stage` (move Kanban)

### 2.3 Frontend
- [ ] Criar página `/projetos` (lista + Kanban toggle)
- [ ] Criar componente `ProjectKanban` (drag & drop)
- [ ] Criar componente `ProjectCard`
- [ ] Criar componente `ProjectModal` (create/edit)
- [ ] Criar página `/projetos/[id]` (detalhe)
- [ ] Criar hook `useProjects` (React Query)
- [ ] Criar hook `useProject` (single project)

### 2.4 Tests
- [ ] Unit: project-service functions
- [ ] Integration: API routes com Supabase mock
- [ ] E2E: criar projeto → mover no Kanban → ver detalhe

---

## FASE 3: MÓDULO CALCULADORA (Vertical Slice)

### 3.1 Schema/Database
- [ ] Criar migration: tabela `pricing_config`
  - id, service_type, tier, base_price, multipliers (JSONB)
- [ ] Seed com dados de pricing padrão

### 3.2 Backend/API
- [ ] Criar `src/modules/calculator/services/pricing-engine.ts`
  - Lógica de cálculo por m², por cômodo, multiplicadores
- [ ] API route `POST /api/calculator/calculate`
- [ ] API route `GET /api/calculator/pricing-config`

### 3.3 Frontend
- [ ] Criar página `/orcamentos/novo` (calculadora)
- [ ] Criar componente `ClientForm` (dados cliente)
- [ ] Criar componente `ServiceSelector` (tipo serviço)
- [ ] Criar componente `AreaConfig` (m², cômodos)
- [ ] Criar componente `ResultDisplay` (resultado)
- [ ] Criar hook `useCalculator`

### 3.4 Tests
- [ ] Unit: pricing-engine (todos cenários de cálculo)
- [ ] Integration: API calculate
- [ ] E2E: preencher form → ver resultado → salvar

---

## FASE 4: MÓDULO ORÇAMENTOS (Vertical Slice)

### 4.1 Schema/Database
- [ ] Criar migration: tabela `budgets`
  - id, project_id, client_data (JSONB), service_type, total_value, status
- [ ] Criar migration: tabela `budget_items`
  - id, budget_id, name, category, quantity, unit_price, supplier, link, image_url
- [ ] Criar RLS policies

### 4.2 Backend/API
- [ ] Criar `src/modules/budgets/services/budget-service.ts`
- [ ] API route `GET /api/budgets` (list)
- [ ] API route `POST /api/budgets` (create from calculator)
- [ ] API route `GET /api/budgets/[id]`
- [ ] API route `PATCH /api/budgets/[id]`
- [ ] API route `POST /api/budgets/[id]/items` (add item)
- [ ] API route `PATCH /api/budgets/[id]/items/[itemId]`
- [ ] API route `DELETE /api/budgets/[id]/items/[itemId]`

### 4.3 Frontend
- [ ] Criar página `/orcamentos` (lista)
- [ ] Criar página `/orcamentos/[id]` (detalhe com itens)
- [ ] Criar componente `BudgetItemsTable`
- [ ] Criar componente `BudgetItemModal` (add/edit item)
- [ ] Criar componente `BudgetSummary` (totais por categoria)
- [ ] Criar hook `useBudgets`
- [ ] Criar hook `useBudget`

### 4.4 Tests
- [ ] Unit: budget-service
- [ ] Integration: CRUD de items
- [ ] E2E: criar orçamento → adicionar itens → ver totais

---

## FASE 5: MÓDULO APRESENTAÇÕES (Vertical Slice)

### 5.1 Schema/Database
- [ ] Criar migration: tabela `presentations`
  - id, project_id, name, phase, client_data (JSONB)
- [ ] Criar migration: tabela `presentation_images`
  - id, presentation_id, section, image_url, order
- [ ] Criar migration: tabela `presentation_items` (layout)
  - id, presentation_id, name, category, ambiente, position (JSONB), price
- [ ] Configurar Supabase Storage bucket `presentation-images`

### 5.2 Backend/API
- [ ] Criar `src/modules/presentations/services/presentation-service.ts`
- [ ] API route `POST /api/presentations`
- [ ] API route `GET /api/presentations/[id]`
- [ ] API route `PATCH /api/presentations/[id]`
- [ ] API route `POST /api/presentations/[id]/images` (upload)
- [ ] API route `DELETE /api/presentations/[id]/images/[imageId]`
- [ ] API route `POST /api/presentations/[id]/items`

### 5.3 Frontend
- [ ] Criar página `/apresentacoes`
- [ ] Criar página `/apresentacoes/[id]` com tabs:
  - Tab Apresentação (uploads)
  - Tab Layout (planta + itens)
  - Tab Compras (lista)
  - Tab Detalhamento
  - Tab Orçamento
  - Tab Exportar
- [ ] Criar componente `ImageUploadZone`
- [ ] Criar componente `FloorPlanEditor`
- [ ] Criar componente `PresentationItemsList`
- [ ] Criar hook `usePresentation`

### 5.4 Tests
- [ ] Unit: presentation-service
- [ ] Integration: upload de imagens
- [ ] E2E: criar apresentação → upload → adicionar itens

---

## FASE 6: MÓDULO DOCUMENTOS (Vertical Slice)

### 6.1 Backend/API
- [ ] Criar `src/modules/documents/generators/pptx-generator.ts`
- [ ] Criar `src/modules/documents/generators/excel-generator.ts`
- [ ] Criar `src/modules/documents/generators/pdf-generator.ts`
- [ ] Criar `src/modules/documents/generators/docx-generator.ts`
- [ ] API route `POST /api/documents/pptx` (gera apresentação)
- [ ] API route `POST /api/documents/excel` (gera orçamento)
- [ ] API route `POST /api/documents/pdf` (gera proposta)
- [ ] API route `POST /api/documents/docx` (gera proposta Word)

### 6.2 Frontend
- [ ] Criar componente `ExportButton` (com loading)
- [ ] Criar componente `ExportOptions` (checkboxes)
- [ ] Integrar na Tab Exportar das apresentações
- [ ] Integrar na página de orçamentos

### 6.3 Tests
- [ ] Unit: cada generator (output válido)
- [ ] Integration: API routes retornam arquivo
- [ ] E2E: gerar documento → download funciona

---

## FASE 7: MÓDULO AI (Vertical Slice)

### 7.1 Backend/API
- [ ] Criar `src/shared/lib/openrouter.ts` (client config)
- [ ] Criar `src/modules/ai/services/briefing-service.ts`
- [ ] Criar `src/modules/ai/services/brandbook-service.ts`
- [ ] Criar `src/modules/ai/services/product-extractor-service.ts`
- [ ] API route `POST /api/ai/briefing` (gera memorial)
- [ ] API route `POST /api/ai/brandbook` (gera brandbook)
- [ ] API route `POST /api/ai/moodboard-prompt` (gera prompt)
- [ ] API route `POST /api/ai/extract-product` (extrai dados de link)

### 7.2 Frontend
- [ ] Criar componente `BriefingAIModal`
- [ ] Criar componente `BrandbookWizard`
- [ ] Criar componente `ProductLinkExtractor`
- [ ] Integrar extração de produto no form de itens

### 7.3 Tests
- [ ] Unit: services com mock do OpenRouter
- [ ] Integration: API routes com mock
- [ ] E2E: usar AI briefing → ver resultado

---

## FASE 8: DASHBOARD & FINANCEIRO (Vertical Slice)

### 8.1 Schema/Database
- [ ] Criar views agregadas para stats
- [ ] Criar migration: tabela `financial_entries` (opcional)

### 8.2 Backend/API
- [ ] API route `GET /api/dashboard/stats`
- [ ] API route `GET /api/dashboard/recent-projects`
- [ ] API route `GET /api/financial/summary`

### 8.3 Frontend
- [ ] Criar página `/dashboard` (home)
- [ ] Criar componente `DashboardStats`
- [ ] Criar componente `RecentProjects`
- [ ] Criar página `/financeiro`
- [ ] Criar componente `FinancialChart` (Recharts)

### 8.4 Tests
- [ ] Unit: cálculos de stats
- [ ] Integration: API stats
- [ ] E2E: dashboard carrega com dados

---

## FASE 9: POLISH & DEPLOY

### 9.1 UX Polish
- [ ] Loading states em todas páginas
- [ ] Error boundaries
- [ ] Toast notifications (sonner)
- [ ] Empty states
- [ ] Responsive design (mobile)

### 9.2 Performance
- [ ] Implementar React Suspense
- [ ] Otimizar imagens (next/image)
- [ ] Implementar cache com React Query

### 9.3 Deploy
- [ ] Configurar Vercel
- [ ] Configurar variáveis de ambiente produção
- [ ] Configurar domínio
- [ ] Setup Supabase produção

### 9.4 Documentação
- [ ] Atualizar README com instruções
- [ ] Documentar API routes
- [ ] Criar guia de contribuição

---

## BACKLOG (Futuro)

- [ ] Real-time collaboration (Supabase Realtime)
- [ ] Project versioning / histórico
- [ ] Notificações push
- [ ] Multi-tenancy (múltiplos escritórios)
- [ ] Integração com fornecedores (API)
- [ ] App mobile (React Native)

---

## Legenda

- [ ] Pendente
- [x] Concluído
- [~] Em progresso

---
