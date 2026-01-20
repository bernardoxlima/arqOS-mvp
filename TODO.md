# TODO - ArqOS MVP

> **Formato:** Tasks atômicas divisíveis entre 2 devs
>
> **Legenda de cores/categorias:**
> - 🟢 **BACKEND** - Schema, API, Services
> - 🔵 **FRONTEND** - Pages, Components, UI
> - 🟣 **AI/INTEGRAÇÃO** - OpenRouter, Supabase Functions
> - 🟡 **TESTES** - Unit, Integration, E2E
> - 🟠 **INFRA/DEPLOY** - Config, CI/CD, Env

---

## 🚀 FASE 0: SETUP

### Projeto Base
- [ ] 🟠 Criar projeto Next.js 16.1.4 com TypeScript
- [ ] 🟠 Configurar Tailwind CSS 4.0
- [ ] 🟠 Configurar ESLint + Prettier
- [ ] 🟠 Configurar path aliases (@/)
- [ ] 🟠 Criar estrutura de pastas (modules/, shared/, app/)
- [ ] 🟠 Configurar .env.example
- [ ] 🟠 Criar .gitignore adequado

### shadcn/ui
- [ ] 🔵 Rodar npx shadcn@latest init
- [ ] 🔵 Instalar button, card, input, label
- [ ] 🔵 Instalar dialog, sheet, dropdown-menu
- [ ] 🔵 Instalar form, select, checkbox, switch
- [ ] 🔵 Instalar tabs, accordion, toast
- [ ] 🔵 Instalar table, skeleton, avatar
- [ ] 🔵 Instalar sidebar (novo componente)

### Supabase
- [ ] 🟢 Criar projeto no Supabase
- [ ] 🟢 Configurar supabase/client.ts (browser)
- [ ] 🟢 Configurar supabase/server.ts (SSR)
- [ ] 🟢 Configurar supabase/middleware.ts
- [ ] 🟢 Gerar types do banco (database.types.ts)

### Testing
- [ ] 🟡 Instalar e configurar Vitest
- [ ] 🟡 Instalar Testing Library
- [ ] 🟡 Instalar Playwright
- [ ] 🟡 Criar scripts npm (test, test:e2e)
- [ ] 🟡 Criar primeiro teste de sanidade

---

## 🔐 FASE 1: AUTH

### Database
- [ ] 🟢 Criar migration tabela profiles
- [ ] 🟢 Criar campos: id, user_id, full_name, email, role
- [ ] 🟢 Criar campo avatar_url
- [ ] 🟢 Criar RLS policy SELECT para próprio user
- [ ] 🟢 Criar RLS policy UPDATE para próprio user
- [ ] 🟢 Criar trigger auto-create profile on signup

### API
- [ ] 🟢 Criar route /api/auth/callback
- [ ] 🟢 Criar função getSession server-side
- [ ] 🟢 Criar função getUser server-side
- [ ] 🟢 Criar função signOut server action

### Frontend Auth
- [ ] 🔵 Criar página /login
- [ ] 🔵 Criar form de login (email + senha)
- [ ] 🔵 Criar página /register
- [ ] 🔵 Criar form de registro (nome + email + senha)
- [ ] 🔵 Criar validação Zod para forms
- [ ] 🔵 Criar feedback de erro no form
- [ ] 🔵 Criar loading state nos botões

### Context & Guards
- [ ] 🔵 Criar AuthContext
- [ ] 🔵 Criar hook useAuth
- [ ] 🔵 Criar componente AuthGuard
- [ ] 🔵 Criar layout (auth) para páginas públicas
- [ ] 🔵 Criar layout (dashboard) para páginas protegidas
- [ ] 🔵 Criar redirect automático se não logado

### Testes Auth
- [ ] 🟡 Test unit: validação Zod login
- [ ] 🟡 Test unit: validação Zod register
- [ ] 🟡 Test integration: AuthContext
- [ ] 🟡 Test E2E: fluxo login completo
- [ ] 🟡 Test E2E: fluxo registro completo

---

## 📁 FASE 2: PROJETOS

### Database
- [ ] 🟢 Criar migration tabela projects
- [ ] 🟢 Campos: id, name, client_name, status
- [ ] 🟢 Campos: phase, total_value, created_by
- [ ] 🟢 Campos: created_at, updated_at
- [ ] 🟢 Criar migration tabela project_stages
- [ ] 🟢 Campos stage: id, project_id, stage_name, order
- [ ] 🟢 Campos stage: hours_spent, completed_at
- [ ] 🟢 Criar RLS policies projects
- [ ] 🟢 Criar índice por created_by
- [ ] 🟢 Criar índice por status

### API Projects
- [ ] 🟢 Criar project-service.ts
- [ ] 🟢 Função listProjects com filtros
- [ ] 🟢 Função getProject por id
- [ ] 🟢 Função createProject
- [ ] 🟢 Função updateProject
- [ ] 🟢 Função deleteProject
- [ ] 🟢 API route GET /api/projects
- [ ] 🟢 API route POST /api/projects
- [ ] 🟢 API route GET /api/projects/[id]
- [ ] 🟢 API route PATCH /api/projects/[id]
- [ ] 🟢 API route DELETE /api/projects/[id]

### API Kanban
- [ ] 🟢 Função moveProjectStage
- [ ] 🟢 Função updateStageHours
- [ ] 🟢 API route PATCH /api/projects/[id]/stage
- [ ] 🟢 API route POST /api/projects/[id]/stages

### Frontend Lista
- [ ] 🔵 Criar página /projetos
- [ ] 🔵 Criar componente ProjectsHeader
- [ ] 🔵 Criar toggle Lista/Kanban
- [ ] 🔵 Criar componente ProjectCard
- [ ] 🔵 Criar filtro por status
- [ ] 🔵 Criar busca por nome/cliente
- [ ] 🔵 Criar empty state "sem projetos"

### Frontend Kanban
- [ ] 🔵 Criar componente ProjectKanban
- [ ] 🔵 Criar colunas por stage
- [ ] 🔵 Implementar drag & drop
- [ ] 🔵 Criar modal input de horas ao mover
- [ ] 🔵 Criar indicador visual de progresso

### Frontend Detalhe
- [ ] 🔵 Criar página /projetos/[id]
- [ ] 🔵 Criar header com nome + status
- [ ] 🔵 Criar seção dados do cliente
- [ ] 🔵 Criar timeline de stages
- [ ] 🔵 Criar ações (editar, deletar)

### Frontend Modais
- [ ] 🔵 Criar ProjectModal (criar/editar)
- [ ] 🔵 Criar form projeto (nome, cliente, fase)
- [ ] 🔵 Criar DeleteConfirmModal
- [ ] 🔵 Criar hook useProjects (React Query)
- [ ] 🔵 Criar hook useProject (single)

### Testes Projetos
- [ ] 🟡 Test unit: project-service
- [ ] 🟡 Test integration: API routes
- [ ] 🟡 Test E2E: criar projeto
- [ ] 🟡 Test E2E: mover no Kanban
- [ ] 🟡 Test E2E: editar projeto

---

## 🧮 FASE 3: CALCULADORA

### Database
- [ ] 🟢 Criar migration tabela pricing_config
- [ ] 🟢 Campos: service_type, tier, base_price
- [ ] 🟢 Campo multipliers (JSONB)
- [ ] 🟢 Criar seed dados pricing padrão
- [ ] 🟢 Seed: DecorExpress tiers (P, M, G)
- [ ] 🟢 Seed: ProjetExpress por m²
- [ ] 🟢 Seed: multiplicadores (complexidade, acabamento)

### API Calculadora
- [ ] 🟢 Criar pricing-engine.ts
- [ ] 🟢 Função calcular por m²
- [ ] 🟢 Função calcular por cômodo
- [ ] 🟢 Função aplicar multiplicadores
- [ ] 🟢 Função calcular horas estimadas
- [ ] 🟢 API route POST /api/calculator/calculate
- [ ] 🟢 API route GET /api/calculator/config

### Frontend Calculadora
- [ ] 🔵 Criar página /orcamentos/novo
- [ ] 🔵 Criar componente CalculatorWizard
- [ ] 🔵 Step 1: ClientForm (nome, telefone, email)
- [ ] 🔵 Step 2: ServiceSelector (tipo serviço)
- [ ] 🔵 Step 3: AreaConfig (m² ou cômodos)
- [ ] 🔵 Step 4: OptionsConfig (multiplicadores)
- [ ] 🔵 Step 5: ResultDisplay (valor final)
- [ ] 🔵 Criar botão "Salvar Orçamento"
- [ ] 🔵 Criar botão "Gerar PDF"
- [ ] 🔵 Criar hook useCalculator

### Testes Calculadora
- [ ] 🟡 Test unit: cálculo por m²
- [ ] 🟡 Test unit: cálculo por cômodo
- [ ] 🟡 Test unit: multiplicadores
- [ ] 🟡 Test integration: API calculate
- [ ] 🟡 Test E2E: fluxo completo calculadora

---

## 💰 FASE 4: ORÇAMENTOS

### Database
- [ ] 🟢 Criar migration tabela budgets
- [ ] 🟢 Campos: id, project_id, status
- [ ] 🟢 Campo client_data (JSONB)
- [ ] 🟢 Campos: service_type, total_value
- [ ] 🟢 Criar migration tabela budget_items
- [ ] 🟢 Campos item: name, category, quantity
- [ ] 🟢 Campos item: unit_price, supplier
- [ ] 🟢 Campos item: link, image_url
- [ ] 🟢 Criar RLS policies budgets
- [ ] 🟢 Criar RLS policies budget_items

### API Orçamentos
- [ ] 🟢 Criar budget-service.ts
- [ ] 🟢 Função listBudgets
- [ ] 🟢 Função getBudget com items
- [ ] 🟢 Função createBudget
- [ ] 🟢 Função updateBudget
- [ ] 🟢 Função addBudgetItem
- [ ] 🟢 Função updateBudgetItem
- [ ] 🟢 Função deleteBudgetItem
- [ ] 🟢 API route GET /api/budgets
- [ ] 🟢 API route POST /api/budgets
- [ ] 🟢 API route GET /api/budgets/[id]
- [ ] 🟢 API route PATCH /api/budgets/[id]
- [ ] 🟢 API route POST /api/budgets/[id]/items
- [ ] 🟢 API route PATCH /api/budgets/[id]/items/[itemId]
- [ ] 🟢 API route DELETE /api/budgets/[id]/items/[itemId]

### Frontend Lista Orçamentos
- [ ] 🔵 Criar página /orcamentos
- [ ] 🔵 Criar componente BudgetCard
- [ ] 🔵 Criar filtro por status
- [ ] 🔵 Criar busca por cliente
- [ ] 🔵 Criar empty state

### Frontend Detalhe Orçamento
- [ ] 🔵 Criar página /orcamentos/[id]
- [ ] 🔵 Criar header com valor total
- [ ] 🔵 Criar BudgetItemsTable
- [ ] 🔵 Criar edição inline de preço
- [ ] 🔵 Criar edição inline de quantidade
- [ ] 🔵 Criar BudgetSummary por categoria
- [ ] 🔵 Criar BudgetItemModal (add/edit)
- [ ] 🔵 Criar botão exportar Excel
- [ ] 🔵 Criar botão exportar PDF

### Testes Orçamentos
- [ ] 🟡 Test unit: budget-service
- [ ] 🟡 Test integration: CRUD items
- [ ] 🟡 Test E2E: criar orçamento
- [ ] 🟡 Test E2E: adicionar itens
- [ ] 🟡 Test E2E: exportar

---

## 🎨 FASE 5: APRESENTAÇÕES

### Database
- [ ] 🟢 Criar migration tabela presentations
- [ ] 🟢 Campos: id, project_id, name, phase
- [ ] 🟢 Campo client_data (JSONB)
- [ ] 🟢 Criar migration tabela presentation_images
- [ ] 🟢 Campos: section, image_url, order
- [ ] 🟢 Criar migration tabela presentation_items
- [ ] 🟢 Campos: name, category, ambiente
- [ ] 🟢 Campo position (JSONB) para planta
- [ ] 🟢 Campos: price, supplier, link
- [ ] 🟢 Criar Storage bucket presentation-images
- [ ] 🟢 Criar RLS policies Storage

### API Apresentações
- [ ] 🟢 Criar presentation-service.ts
- [ ] 🟢 Função createPresentation
- [ ] 🟢 Função getPresentation completa
- [ ] 🟢 Função updatePresentation
- [ ] 🟢 Função uploadImage (Storage)
- [ ] 🟢 Função deleteImage
- [ ] 🟢 Função addPresentationItem
- [ ] 🟢 Função updatePresentationItem
- [ ] 🟢 API route POST /api/presentations
- [ ] 🟢 API route GET /api/presentations/[id]
- [ ] 🟢 API route PATCH /api/presentations/[id]
- [ ] 🟢 API route POST /api/presentations/[id]/images
- [ ] 🟢 API route DELETE /api/presentations/[id]/images/[imageId]
- [ ] 🟢 API route POST /api/presentations/[id]/items

### Frontend Lista
- [ ] 🔵 Criar página /apresentacoes
- [ ] 🔵 Criar PresentationCard
- [ ] 🔵 Criar filtros e busca
- [ ] 🔵 Criar botão nova apresentação

### Frontend Tab Apresentação
- [ ] 🔵 Criar página /apresentacoes/[id]
- [ ] 🔵 Criar sistema de tabs (6 tabs)
- [ ] 🔵 Criar TabApresentacao
- [ ] 🔵 Criar ImageUploadZone
- [ ] 🔵 Criar seção Fotos Antes (max 4)
- [ ] 🔵 Criar seção Moodboard (max 1)
- [ ] 🔵 Criar seção Referências (max 6)
- [ ] 🔵 Criar seção Planta Baixa (max 1)
- [ ] 🔵 Criar seção Renders (max 10, min 1)
- [ ] 🔵 Criar form dados cliente

### Frontend Tab Layout
- [ ] 🔵 Criar TabLayout
- [ ] 🔵 Criar FloorPlanEditor
- [ ] 🔵 Criar visualização planta com itens
- [ ] 🔵 Criar marcadores numerados coloridos
- [ ] 🔵 Criar form adicionar item layout
- [ ] 🔵 Criar lista itens layout
- [ ] 🔵 Criar seção itens complementares
- [ ] 🔵 Criar form adicionar complementar

### Frontend Tab Compras
- [ ] 🔵 Criar TabCompras
- [ ] 🔵 Criar tabela todos itens
- [ ] 🔵 Criar filtro por ambiente
- [ ] 🔵 Criar filtro por categoria
- [ ] 🔵 Criar status (completo/pendente)
- [ ] 🔵 Criar botão gerar PPT Shopping

### Frontend Tab Detalhamento
- [ ] 🔵 Criar TabDetalhamento
- [ ] 🔵 Criar view por categoria
- [ ] 🔵 Criar planta + itens lado a lado
- [ ] 🔵 Criar botão gerar PPT Detalhamento

### Frontend Tab Orçamento
- [ ] 🔵 Criar TabOrcamento
- [ ] 🔵 Criar totais por categoria
- [ ] 🔵 Criar valor/m² por ambiente
- [ ] 🔵 Criar edição inline
- [ ] 🔵 Criar botão exportar Excel

### Frontend Tab Exportar
- [ ] 🔵 Criar TabExportar
- [ ] 🔵 Criar checklist completude
- [ ] 🔵 Criar checkboxes seleção exports
- [ ] 🔵 Criar preview slides
- [ ] 🔵 Criar botão gerar tudo

### Testes Apresentações
- [ ] 🟡 Test unit: presentation-service
- [ ] 🟡 Test integration: upload imagens
- [ ] 🟡 Test E2E: criar apresentação
- [ ] 🟡 Test E2E: upload + adicionar itens

---

## 📄 FASE 6: DOCUMENTOS

### Geradores Backend
- [ ] 🟢 Criar pptx-generator.ts
- [ ] 🟢 Gerar PPT Apresentação (capa + renders)
- [ ] 🟢 Gerar PPT Shopping List
- [ ] 🟢 Gerar PPT Orçamento
- [ ] 🟢 Gerar PPT Detalhamento
- [ ] 🟢 Criar excel-generator.ts
- [ ] 🟢 Gerar Excel orçamento formatado
- [ ] 🟢 Criar pdf-generator.ts
- [ ] 🟢 Gerar PDF proposta
- [ ] 🟢 Criar docx-generator.ts
- [ ] 🟢 Gerar Word proposta

### API Documentos
- [ ] 🟢 API route POST /api/documents/pptx
- [ ] 🟢 API route POST /api/documents/excel
- [ ] 🟢 API route POST /api/documents/pdf
- [ ] 🟢 API route POST /api/documents/docx

### Frontend Documentos
- [ ] 🔵 Criar ExportButton com loading
- [ ] 🔵 Criar ExportOptionsModal
- [ ] 🔵 Integrar em TabExportar
- [ ] 🔵 Integrar em página orçamentos
- [ ] 🔵 Criar feedback download sucesso

### Testes Documentos
- [ ] 🟡 Test unit: cada generator
- [ ] 🟡 Test integration: API retorna arquivo
- [ ] 🟡 Test E2E: gerar + download

---

## 🤖 FASE 7: AI

### OpenRouter Setup
- [ ] 🟣 Criar openrouter.ts client
- [ ] 🟣 Configurar env OPENROUTER_API_KEY
- [ ] 🟣 Criar wrapper com error handling
- [ ] 🟣 Criar tipos de resposta

### AI Briefing
- [ ] 🟣 Criar briefing-service.ts
- [ ] 🟣 Prompt gerar memorial de briefing
- [ ] 🟣 Prompt gerar prompt moodboard
- [ ] 🟣 Prompt gerar prompt referência
- [ ] 🟣 API route POST /api/ai/briefing

### AI Brandbook
- [ ] 🟣 Criar brandbook-service.ts
- [ ] 🟣 Prompt gerar brandbook completo
- [ ] 🟣 API route POST /api/ai/brandbook

### AI Extrator Produto
- [ ] 🟣 Criar product-extractor-service.ts
- [ ] 🟣 Prompt extrair dados de link
- [ ] 🟣 Extrair: nome, preço, fornecedor, imagem
- [ ] 🟣 API route POST /api/ai/extract-product

### Frontend AI
- [ ] 🔵 Criar BriefingAIModal
- [ ] 🔵 Criar textarea transcrição
- [ ] 🔵 Criar output memorial formatado
- [ ] 🔵 Criar BrandbookWizard
- [ ] 🔵 Criar questionário etapas
- [ ] 🔵 Criar output brandbook
- [ ] 🔵 Criar ProductLinkInput
- [ ] 🔵 Criar auto-fill ao colar link

### Testes AI
- [ ] 🟡 Test unit: services com mock
- [ ] 🟡 Test integration: API routes
- [ ] 🟡 Test E2E: usar briefing AI

---

## 📊 FASE 8: DASHBOARD

### API Dashboard
- [ ] 🟢 Criar dashboard-service.ts
- [ ] 🟢 Função calcular stats gerais
- [ ] 🟢 Função listar projetos recentes
- [ ] 🟢 Função calcular financeiro
- [ ] 🟢 API route GET /api/dashboard/stats
- [ ] 🟢 API route GET /api/dashboard/recent
- [ ] 🟢 API route GET /api/financial/summary

### Frontend Dashboard
- [ ] 🔵 Criar página /dashboard (home)
- [ ] 🔵 Criar DashboardStats cards
- [ ] 🔵 Card: total projetos
- [ ] 🔵 Card: valor total
- [ ] 🔵 Card: projetos entregues
- [ ] 🔵 Card: em andamento
- [ ] 🔵 Criar RecentProjects lista
- [ ] 🔵 Criar QuickActions

### Frontend Financeiro
- [ ] 🔵 Criar página /financeiro
- [ ] 🔵 Criar FinancialSummary
- [ ] 🔵 Criar FinancialChart (Recharts)
- [ ] 🔵 Criar filtro por período
- [ ] 🔵 Criar tabela entradas

### Testes Dashboard
- [ ] 🟡 Test unit: cálculos stats
- [ ] 🟡 Test integration: API stats
- [ ] 🟡 Test E2E: dashboard carrega

---

## 🚢 FASE 9: DEPLOY

### Polish UX
- [ ] 🔵 Criar loading states todas páginas
- [ ] 🔵 Criar error boundaries
- [ ] 🔵 Configurar toast notifications
- [ ] 🔵 Criar empty states
- [ ] 🔵 Revisar responsivo mobile
- [ ] 🔵 Criar 404 page
- [ ] 🔵 Criar 500 page

### Performance
- [ ] 🔵 Implementar React Suspense
- [ ] 🔵 Otimizar imagens next/image
- [ ] 🔵 Configurar cache React Query
- [ ] 🔵 Lazy load componentes pesados

### Deploy
- [ ] 🟠 Criar projeto Vercel
- [ ] 🟠 Configurar env produção
- [ ] 🟠 Configurar domínio
- [ ] 🟠 Setup Supabase produção
- [ ] 🟠 Testar fluxos em produção

### Docs
- [ ] 🟠 Atualizar README
- [ ] 🟠 Documentar API routes
- [ ] 🟠 Criar guia contribuição
- [ ] 🟠 Atualizar CLAUDE.md

---

## 📋 BACKLOG (Futuro)

- [ ] Real-time collaboration
- [ ] Project versioning
- [ ] Notificações push
- [ ] Multi-tenancy
- [ ] Integração fornecedores API
- [ ] App mobile

---

## Como dividir entre 2 devs

**DEV 1 (Backend-focused):** 🟢 + 🟣
- Database migrations
- API routes
- Services
- AI integrations
- Document generators

**DEV 2 (Frontend-focused):** 🔵 + 🟠
- Pages e layouts
- Components
- Forms e validações
- UI/UX polish
- Deploy e infra

**Ambos:** 🟡
- Testes (cada um testa o que construiu)

---

**Última atualização:** 2024-01-20
