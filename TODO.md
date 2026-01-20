# TODO - ArqOS MVP

> **Formato:** Tasks atômicas orientadas a features
>
> **Legenda:**
> - 🟢 **BACKEND** - Banco, API, Lógica
> - 🔵 **FRONTEND** - Telas, Componentes, UI
> - 🟣 **AI/INTEGRAÇÃO** - OpenRouter, Automações
> - 🟡 **TESTES** - Unit, Integration, E2E
> - 🟠 **INFRA/DEPLOY** - Config, CI/CD, Env

---

## ✅ FASE 0: SETUP (CONCLUÍDA)

### Projeto Base
- [x] 🟠 Inicializar projeto Next.js com TypeScript
- [x] 🟠 Configurar Tailwind para estilização
- [x] 🟠 Configurar linting e formatação de código
- [x] 🟠 Definir estrutura de pastas do projeto
- [x] 🟠 Criar arquivo de variáveis de ambiente exemplo
- [x] 🟠 Configurar gitignore adequado

### Biblioteca de Componentes
- [x] 🔵 Inicializar shadcn/ui no projeto
- [x] 🔵 Adicionar componentes básicos (botão, card, input)
- [x] 🔵 Adicionar componentes de modal e dropdown
- [x] 🔵 Adicionar componentes de formulário
- [x] 🔵 Adicionar componentes de navegação (tabs, accordion)
- [x] 🔵 Adicionar componentes de tabela e loading
- [x] 🔵 Adicionar componente de sidebar

### Conexão com Banco
- [x] 🟢 Criar projeto no Supabase
- [x] 🟢 Configurar conexão do frontend com Supabase
- [x] 🟢 Configurar conexão server-side com Supabase
- [x] 🟢 Criar middleware de autenticação
- [x] 🟢 Gerar tipos TypeScript do banco

### Testes
- [x] 🟡 Configurar framework de testes unitários
- [x] 🟡 Configurar testes de componentes
- [x] 🟡 Configurar testes end-to-end
- [x] 🟡 Criar scripts de teste no package.json
- [x] 🟡 Criar primeiro teste de sanidade

---

## ✅ BANCO DE DADOS (COMPLETO)

> **14 migrations aplicadas** em 2026-01-20
>
> Todas as tabelas, índices, RLS policies, triggers e storage buckets foram criados.

### Tabelas Criadas (13 total)
- [x] 🟢 `organizations` - Multi-tenant root entity
- [x] 🟢 `profiles` - Usuários vinculados ao Supabase Auth
- [x] 🟢 `clients` - Base de clientes
- [x] 🟢 `budgets` - Orçamentos/Propostas
- [x] 🟢 `projects` - Projetos com workflow Kanban
- [x] 🟢 `time_entries` - Registro de horas
- [x] 🟢 `project_items` - Itens de projeto (18 categorias)
- [x] 🟢 `finance_records` - Registros financeiros
- [x] 🟢 `lookup_data` - Dados de referência
- [x] 🟢 `activity_log` - Auditoria (append-only)
- [x] 🟢 `presentations` - Apresentações de projeto
- [x] 🟢 `presentation_images` - Imagens por seção
- [x] 🟢 `presentation_items` - Itens de layout/complementares

### Infraestrutura de Banco
- [x] 🟢 Índices para performance em todas as tabelas
- [x] 🟢 RLS policies para isolamento multi-tenant
- [x] 🟢 Triggers de `updated_at` automático
- [x] 🟢 Trigger de auto-create profile no signup
- [x] 🟢 Trigger de auto-generate codes (PROP-YYNNN, ARQ-YYNNN)
- [x] 🟢 Trigger de snapshot de cliente em budgets/projects
- [x] 🟢 Trigger de validação de limites de imagens por seção
- [x] 🟢 Função `get_user_organization_id()` para RLS
- [x] 🟢 Views de monitoramento (db_health, table_sizes, etc.)

### Storage Buckets
- [x] 🟢 `avatars` (public) - Fotos de perfil
- [x] 🟢 `project-images` (private) - Imagens de projeto
- [x] 🟢 `project-files` (private) - Documentos
- [x] 🟢 `proposals` (private) - Propostas geradas
- [x] 🟢 `presentation-images` (private) - Imagens de apresentação

### Tipos TypeScript
- [x] 🟢 Gerado `database.types.ts` com tipos de todas as tabelas

---

## ✅ FASE 1: AUTH (CONCLUÍDA)

### Banco de Dados ✅
- [x] 🟢 Criar tabela de perfis de usuário
- [x] 🟢 Adicionar campos nome, email e role
- [x] 🟢 Adicionar campo de foto de perfil (em settings.avatar_url)
- [x] 🟢 Criar regra: usuário só vê próprio perfil
- [x] 🟢 Criar regra: usuário só edita próprio perfil
- [x] 🟢 Criar perfil automático ao cadastrar

### Lógica de Autenticação ✅
- [x] 🟢 Criar lógica de callback após login (`/api/auth/callback`)
- [x] 🟢 Criar função para buscar sessão atual (AuthContext)
- [x] 🟢 Criar função para buscar dados do usuário (fetchProfile)
- [x] 🟢 Criar função de logout (signOut)

### Tela de Login ✅
- [x] 🔵 Criar página de login (`/login`)
- [x] 🔵 Criar formulário com email e senha
- [x] 🔵 Criar página de cadastro (`/cadastro`)
- [x] 🔵 Criar formulário de cadastro (nome, email, senha)
- [x] 🔵 Adicionar validação nos campos (Zod schemas)
- [x] 🔵 Mostrar erros de validação (FormMessage)
- [x] 🔵 Adicionar loading nos botões (Loader2 spinner)

### Proteção de Rotas ✅
- [x] 🔵 Criar contexto de autenticação (AuthProvider)
- [x] 🔵 Criar hook useAuth
- [x] 🔵 Criar componente que protege páginas (middleware)
- [x] 🔵 Criar layout para páginas públicas (`(auth)/layout.tsx`)
- [x] 🔵 Criar layout para páginas protegidas (`(dashboard)/layout.tsx`)
- [x] 🔵 Redirecionar usuário não logado para login

### Testes de Auth ✅
- [x] 🟡 Testar validação do formulário de login (`schemas.test.ts`)
- [x] 🟡 Testar validação do formulário de cadastro (`schemas.test.ts`)
- [x] 🟡 Testar contexto de autenticação (`context.test.tsx`)
- [x] 🟡 Testar fluxo completo de login (`auth.spec.ts` - E2E)
- [x] 🟡 Testar fluxo completo de cadastro (`auth.spec.ts` - E2E)

---

## ✅ FASE 2: PROJETOS (COMPLETA)

### Banco de Dados ✅
- [x] 🟢 Criar tabela de projetos
- [x] 🟢 Adicionar campos nome, cliente, status
- [x] 🟢 Adicionar campos fase, valor total, criado por
- [x] 🟢 Adicionar campos de data (criação, atualização)
- [x] 🟢 Criar workflow Kanban (stages em JSON)
- [x] 🟢 Adicionar campos de horas estimadas/usadas
- [x] 🟢 Adicionar campo completed_at auto-set
- [x] 🟢 Criar regras de acesso aos projetos (RLS)
- [x] 🟢 Criar índice para busca por organização
- [x] 🟢 Criar índice para busca por status

### Lógica de Projetos ✅
- [x] 🟢 Criar lógica para listar projetos com filtros (`listProjects`)
- [x] 🟢 Criar lógica para buscar projeto por id (`getProjectById`)
- [x] 🟢 Criar lógica para criar novo projeto (`createProject`)
- [x] 🟢 Criar lógica para atualizar projeto (`updateProject`)
- [x] 🟢 Criar lógica para deletar projeto (`deleteProject`)
- [x] 🟢 Criar endpoint para listar projetos (`GET /api/projects`)
- [x] 🟢 Criar endpoint para criar projeto (`POST /api/projects`)
- [x] 🟢 Criar endpoint para buscar projeto específico (`GET /api/projects/[id]`)
- [x] 🟢 Criar endpoint para atualizar projeto (`PUT /api/projects/[id]`)
- [x] 🟢 Criar endpoint para deletar projeto (`DELETE /api/projects/[id]`)

### Lógica do Kanban ✅
- [x] 🟢 Criar lógica para mover projeto entre etapas (`kanban.ts`)
- [x] 🟢 Criar lógica para registrar horas na etapa (`addTimeEntry`)
- [x] 🟢 Criar endpoint para mover etapa (`POST /api/projects/[id]/stage`)
- [x] 🟢 Criar endpoint para adicionar etapa (`POST /api/projects/[id]/stages`)
- [x] 🟢 Criar endpoint para timeline (`GET /api/projects/[id]/timeline`)
- [x] 🟢 Criar endpoint para time entry (`POST /api/projects/[id]/time-entry`)

### Tela de Lista de Projetos ✅
- [x] 🔵 Criar página de projetos (`/projetos`)
- [x] 🔵 Criar cabeçalho da página
- [x] 🔵 Criar botão alternar visualização Lista/Kanban
- [x] 🔵 Criar card de projeto (`ProjectCard`)
- [x] 🔵 Criar filtro por status
- [x] 🔵 Criar busca por nome ou cliente
- [x] 🔵 Criar tela vazia "nenhum projeto" (`EmptyState`)

### Tela do Kanban ✅
- [x] 🔵 Criar visualização Kanban (`KanbanBoard`)
- [x] 🔵 Criar colunas por etapa (`KanbanColumn`)
- [x] 🔵 Implementar arrastar e soltar (drag & drop nativo)
- [x] 🔵 Criar modal para informar horas ao mover (`TimeEntryModal`)
- [x] 🔵 Criar indicador visual de progresso

### Tela de Detalhe do Projeto ✅
- [x] 🔵 Criar página de detalhe do projeto (`/projetos/[id]`)
- [x] 🔵 Criar cabeçalho com nome e status
- [x] 🔵 Criar seção com dados do cliente
- [x] 🔵 Criar linha do tempo das etapas (timeline visual)
- [x] 🔵 Criar botões de editar e deletar

### Modais de Projeto ✅
- [x] 🔵 Criar modal de criar/editar projeto (`ProjectModal`)
- [x] 🔵 Criar formulário (nome, cliente, fase)
- [x] 🔵 Criar modal de confirmação de exclusão (AlertDialog)
- [x] 🔵 Criar hook para gerenciar lista de projetos (`useProjects`)
- [x] 🔵 Criar hook para gerenciar projeto individual

### Testes de Projetos ✅
- [x] 🟡 Testar lógica de projetos (33 schema tests)
- [x] 🟡 Testar endpoints de projetos (41 API tests)
- [x] 🟡 Testar criar projeto (covered in `api.test.ts`)
- [x] 🟡 Testar mover no Kanban (covered in `api.test.ts`)
- [x] 🟡 Testar editar projeto (covered in `api.test.ts`)

---

## ✅ FASE 3: CALCULADORA (COMPLETA)

### Banco de Dados ✅
- [x] 🟢 Criar tabela de configuração de preços (`lookup_data`)
- [x] 🟢 Estrutura para tipo de serviço, faixa, preço base
- [x] 🟢 Estrutura para multiplicadores (JSONB)
- [x] 🟢 Popular dados padrão de preços
- [x] 🟢 Popular preços DecorExpress (P, M, G)
- [x] 🟢 Popular preços ProjetExpress por m²
- [x] 🟢 Popular multiplicadores (complexidade, acabamento)

### Lógica de Cálculo ✅
- [x] 🟢 Criar motor de cálculo de preços
- [x] 🟢 Criar lógica de cálculo por m²
- [x] 🟢 Criar lógica de cálculo por cômodo
- [x] 🟢 Criar lógica de aplicar multiplicadores
- [x] 🟢 Criar lógica de estimar horas
- [x] 🟢 Criar endpoint para calcular orçamento
- [x] 🟢 Criar endpoint para buscar configuração de preços

### Tela da Calculadora ✅
- [x] 🔵 Criar página de novo orçamento (`/calculadora`)
- [x] 🔵 Criar wizard de orçamento em etapas (`CalculatorWizard`)
- [x] 🔵 Etapa 1: Seleção do tipo de serviço (`StepService`)
- [x] 🔵 Etapa 2: Configuração de ambientes (`StepEnvironments`)
- [x] 🔵 Etapa 3: Configuração de área/m² (`StepArea`)
- [x] 🔵 Etapa 4: Opções extras (modalidade, pagamento) (`StepOptions`)
- [x] 🔵 Etapa 5: Resultado final com valor (`CalculatorResult`)
- [ ] 🔵 Criar botão salvar orçamento (pendente)
- [ ] 🔵 Criar botão gerar PDF (pendente)
- [x] 🔵 Criar hook para gerenciar calculadora (`useCalculator`)

### Testes da Calculadora ✅
- [x] 🟡 Testar schemas de validação (65 testes)
- [x] 🟡 Testar cálculo por m² (ProjetExpress)
- [x] 🟡 Testar cálculo por cômodo (DecorExpress/Producao)
- [x] 🟡 Testar multiplicadores (tipo, tamanho, combinados)
- [x] 🟡 Testar endpoint de cálculo (23 testes API)
- [x] 🟡 Testar motor de cálculo completo (73 testes)

---

## 💰 FASE 4: ORÇAMENTOS

### Banco de Dados ✅
- [x] 🟢 Criar tabela de orçamentos (`budgets`)
- [x] 🟢 Adicionar campos id, projeto (via client_id), status
- [x] 🟢 Adicionar campo de dados do cliente (client_snapshot)
- [x] 🟢 Adicionar campos tipo de serviço, cálculo (JSONB)
- [x] 🟢 Criar tabela de itens (`project_items`)
- [x] 🟢 Adicionar campos do item: nome, categoria (18 tipos), quantidade
- [x] 🟢 Adicionar campos do item: preço unitário/total
- [x] 🟢 Adicionar campos do item: fornecedor, link, imagem
- [x] 🟢 Criar regras de acesso aos orçamentos (RLS)
- [x] 🟢 Criar regras de acesso aos itens (RLS)

### Lógica de Orçamentos ✅
- [x] 🟢 Criar lógica para listar orçamentos (`listBudgets`)
- [x] 🟢 Criar lógica para buscar orçamento com itens (`getBudgetById`)
- [x] 🟢 Criar lógica para criar orçamento (`createBudget`)
- [x] 🟢 Criar lógica para atualizar orçamento (`updateBudget`)
- [x] 🟢 Criar lógica para adicionar item ao orçamento (`addBudgetItem`)
- [x] 🟢 Criar lógica para atualizar item (`updateBudgetItem`)
- [x] 🟢 Criar lógica para remover item (`removeBudgetItem`)
- [x] 🟢 Criar endpoint para listar orçamentos (`GET /api/budgets`)
- [x] 🟢 Criar endpoint para criar orçamento (`POST /api/budgets`)
- [x] 🟢 Criar endpoint para buscar orçamento (`GET /api/budgets/[id]`)
- [x] 🟢 Criar endpoint para atualizar orçamento (`PUT /api/budgets/[id]`)
- [x] 🟢 Criar endpoint para adicionar item (`POST /api/budgets/[id]/items`)
- [x] 🟢 Criar endpoint para atualizar item (`PUT /api/budgets/[id]/items`)
- [x] 🟢 Criar endpoint para remover item (`DELETE /api/budgets/[id]/items`)

### Tela de Lista de Orçamentos
- [ ] 🔵 Criar página de orçamentos
- [ ] 🔵 Criar card de orçamento
- [ ] 🔵 Criar filtro por status
- [ ] 🔵 Criar busca por cliente
- [ ] 🔵 Criar tela vazia

### Tela de Detalhe do Orçamento
- [ ] 🔵 Criar página de detalhe do orçamento
- [ ] 🔵 Criar cabeçalho com valor total
- [ ] 🔵 Criar tabela de itens
- [ ] 🔵 Permitir editar preço direto na tabela
- [ ] 🔵 Permitir editar quantidade direto na tabela
- [ ] 🔵 Criar resumo por categoria
- [ ] 🔵 Criar modal de adicionar/editar item
- [ ] 🔵 Criar botão exportar Excel
- [ ] 🔵 Criar botão exportar PDF

### Testes de Orçamentos ✅
- [x] 🟡 Testar lógica de orçamentos (55 schema + 16 calculation + 33 default tests)
- [x] 🟡 Testar CRUD de itens (45 API tests)
- [x] 🟡 Testar criar orçamento (covered in `api.test.ts`)
- [x] 🟡 Testar adicionar itens (covered in `api.test.ts`)
- [x] 🟡 Testar exportar (covered in `documents/__tests__`)

---

## 🎨 FASE 5: APRESENTAÇÕES

### Banco de Dados ✅
- [x] 🟢 Criar tabela de apresentações (`presentations`)
- [x] 🟢 Adicionar campos id, projeto, nome, fase, status
- [x] 🟢 Adicionar campo de dados do cliente (client_data JSONB)
- [x] 🟢 Criar tabela de imagens (`presentation_images`)
- [x] 🟢 Adicionar campos: seção (5 tipos), url, ordem
- [x] 🟢 Criar trigger de validação de limites por seção
- [x] 🟢 Criar tabela de itens (`presentation_items`)
- [x] 🟢 Adicionar campos: nome, categoria (12 tipos), ambiente
- [x] 🟢 Adicionar campo de posição na planta (JSONB x,y,rotation,scale)
- [x] 🟢 Adicionar campos: preço, fornecedor, link (em product JSONB)
- [x] 🟢 Criar bucket `presentation-images` (10MB, jpg/png/webp)
- [x] 🟢 Criar regras de acesso ao storage (RLS por org)

### Lógica de Apresentações ✅
- [x] 🟢 Criar lógica para criar apresentação (`presentations.service.ts`)
- [x] 🟢 Criar lógica para buscar apresentação completa (`getPresentationById`)
- [x] 🟢 Criar lógica para atualizar apresentação (`updatePresentation`)
- [x] 🟢 Criar lógica para upload de imagem (`images.service.ts`)
- [x] 🟢 Criar lógica para deletar imagem (`deleteImage`)
- [x] 🟢 Criar lógica para adicionar item (`items.service.ts`)
- [x] 🟢 Criar lógica para atualizar item (`updateItem`)
- [x] 🟢 Criar endpoint para criar apresentação (`POST /api/presentations`)
- [x] 🟢 Criar endpoint para buscar apresentação (`GET /api/presentations/[id]`)
- [x] 🟢 Criar endpoint para atualizar apresentação (`PUT /api/presentations/[id]`)
- [x] 🟢 Criar endpoint para upload de imagem (`POST /api/presentations/[id]/images`)
- [x] 🟢 Criar endpoint para deletar imagem (`DELETE /api/presentations/[id]/images/[imageId]`)
- [x] 🟢 Criar endpoint para adicionar item (`POST /api/presentations/[id]/items`)
- [x] 🟢 Criar endpoint para atualizar item (`PATCH /api/presentations/[id]/items/[itemId]`)

### Tela de Lista de Apresentações ✅
- [x] 🔵 Criar página de apresentações (`/dashboard/apresentacoes/page.tsx`)
- [x] 🔵 Criar card de apresentação (`presentation-card.tsx`)
- [x] 🔵 Criar filtros e busca (`presentations-filters.tsx`)
- [x] 🔵 Criar botão nova apresentação (`new-presentation-modal.tsx`)
- [x] 🔵 Criar skeleton de loading (`presentations-skeleton.tsx`)
- [x] 🔵 Criar estado vazio (`presentations-empty.tsx`)

### Tela da Apresentação - Tab Imagens ✅
- [x] 🔵 Criar página de detalhe da apresentação (`/dashboard/apresentacoes/[id]/page.tsx`)
- [x] 🔵 Criar sistema de abas (6 abas)
- [x] 🔵 Criar aba de Imagens (`tab-imagens.tsx`)
- [x] 🔵 Criar zona de upload de imagens
- [x] 🔵 Criar seção Fotos Antes (max 4)
- [x] 🔵 Criar seção Moodboard (max 1)
- [x] 🔵 Criar seção Referências (max 6)
- [x] 🔵 Criar seção Planta Baixa (max 1)
- [x] 🔵 Criar seção Renders (max 10, min 1)
- [x] 🔵 Criar formulário dados do cliente

### Tela da Apresentação - Tab Layout ✅
- [x] 🔵 Criar aba de Layout (`tab-layout.tsx`)
- [x] 🔵 Criar editor de planta baixa
- [x] 🔵 Criar visualização da planta com itens
- [x] 🔵 Criar marcadores numerados coloridos por categoria
- [x] 🔵 Criar formulário de adicionar item de layout
- [x] 🔵 Criar lista de itens de layout
- [x] 🔵 Criar seção de itens complementares
- [x] 🔵 Criar formulário de adicionar item complementar

### Tela da Apresentação - Tab Compras ✅
- [x] 🔵 Criar aba de Compras (`tab-compras.tsx`)
- [x] 🔵 Criar tabela com todos os itens
- [x] 🔵 Criar filtro por ambiente
- [x] 🔵 Criar filtro por categoria
- [x] 🔵 Criar indicador de status (completo/pendente)
- [x] 🔵 Criar botão gerar PPT de lista de compras

### Tela da Apresentação - Tab Detalhamento ✅
- [x] 🔵 Criar aba de Detalhamento (`tab-detalhamento.tsx`)
- [x] 🔵 Criar visualização por categoria
- [x] 🔵 Criar layout planta + itens lado a lado
- [x] 🔵 Criar botão gerar PPT de detalhamento

### Tela da Apresentação - Tab Orçamento ✅
- [x] 🔵 Criar aba de Orçamento (`tab-orcamento.tsx`)
- [x] 🔵 Criar totais por categoria
- [x] 🔵 Criar valor por m² por ambiente
- [x] 🔵 Permitir edição inline de valores
- [x] 🔵 Criar botão exportar Excel

### Tela da Apresentação - Tab Exportar ✅
- [x] 🔵 Criar aba de Exportar (`tab-exportar.tsx`)
- [x] 🔵 Criar checklist de completude do projeto
- [x] 🔵 Criar checkboxes para selecionar exports
- [x] 🔵 Criar preview dos slides
- [x] 🔵 Criar botão gerar todos os documentos

### Testes de Apresentações ✅
- [x] 🟡 Testar lógica de apresentações (36 tests in `services.test.ts`)
- [x] 🟡 Testar upload de imagens (images service tests)
- [x] 🟡 Testar criar apresentação (presentations service tests)
- [x] 🟡 Testar upload + adicionar itens (items service tests)

---

## 📄 FASE 6: DOCUMENTOS

### Lógica de Geração ✅
- [x] 🟢 Criar gerador de PowerPoint (`pptxgenjs`)
- [x] 🟢 Gerar PPT de apresentação (capa + renders) (`presentation-ppt.ts`)
- [x] 🟢 Gerar PPT de lista de compras (`shopping-list-ppt.ts`)
- [x] 🟢 Gerar PPT de orçamento (`budget-ppt.ts`)
- [x] 🟢 Gerar PPT de detalhamento técnico (`technical-detailing-ppt.ts`)
- [x] 🟢 Criar gerador de Excel (`xlsx`)
- [x] 🟢 Gerar planilha de orçamento formatada (`budget-excel.ts`)
- [x] 🟢 Criar gerador de PDF (`jsPDF`)
- [x] 🟢 Gerar proposta comercial em PDF (`proposal-pdf.ts`)
- [x] 🟢 Criar gerador de Word (`docx`)
- [x] 🟢 Gerar proposta comercial em Word (`proposal-word.ts`)

### Endpoints de Documentos ✅
- [x] 🟢 Criar endpoint para gerar PowerPoint (`POST /api/documents/presentations/[id]/ppt`)
- [x] 🟢 Criar endpoint para gerar Excel (`POST /api/documents/presentations/[id]/budget?format=xlsx`)
- [x] 🟢 Criar endpoint para gerar PDF (`POST /api/documents/proposals?format=pdf`)
- [x] 🟢 Criar endpoint para gerar Word (`POST /api/documents/proposals?format=docx`)
- [x] 🟢 Criar endpoint para lista de compras (`POST /api/documents/presentations/[id]/shopping-list`)
- [x] 🟢 Criar endpoint para detalhamento (`POST /api/documents/presentations/[id]/detailing`)

### Tela de Exportação
- [ ] 🔵 Criar botão de exportar com loading
- [ ] 🔵 Criar modal de opções de exportação
- [ ] 🔵 Integrar na aba Exportar das apresentações
- [ ] 🔵 Integrar na página de orçamentos
- [ ] 🔵 Criar feedback de download concluído

### Testes de Documentos ✅
- [x] 🟡 Testar cada gerador de documento (39 tests in `generators.test.ts`)
- [x] 🟡 Testar endpoints retornam arquivo (31 tests in `api.test.ts`)
- [x] 🟡 Testar gerar e baixar documento

---

## 🤖 FASE 7: AI

### Configuração OpenRouter ✅
- [x] 🟣 Criar cliente de conexão com OpenRouter (`src/shared/lib/openrouter.ts`)
- [x] 🟣 Configurar variável de ambiente da API (`OPENROUTER_API_KEY`)
- [x] 🟣 Criar tratamento de erros da API (AIError class)
- [x] 🟣 Criar tipos de resposta da IA (`src/modules/ai/types.ts`)

### AI para Briefing ✅
- [x] 🟣 Criar lógica de briefing com IA (`briefing.service.ts`)
- [x] 🟣 Criar prompt para gerar memorial de briefing
- [x] 🟣 Criar prompt para gerar descrição de moodboard
- [x] 🟣 Criar prompt para gerar descrição de referência visual
- [x] 🟣 Criar endpoint de briefing com IA (`POST /api/ai/briefing`)

### AI para Brandbook ✅
- [x] 🟣 Criar lógica de brandbook com IA (`brandbook.service.ts`)
- [x] 🟣 Criar prompt para gerar brandbook completo
- [x] 🟣 Criar endpoint de brandbook com IA (`POST /api/ai/brandbook`)

### AI para Extração de Produtos ✅
- [x] 🟣 Criar lógica de extração de produtos (`product-extraction.service.ts`)
- [x] 🟣 Criar prompt para extrair dados de link de produto
- [x] 🟣 Extrair: nome, preço, fornecedor, imagem
- [x] 🟣 Criar endpoint de extração de produto (`POST /api/ai/extract-product`)

### Telas de AI
- [ ] 🔵 Criar modal de briefing com IA
- [ ] 🔵 Criar campo de texto para transcrição
- [ ] 🔵 Criar visualização do memorial gerado
- [ ] 🔵 Criar wizard de brandbook
- [ ] 🔵 Criar questionário em etapas
- [ ] 🔵 Criar visualização do brandbook gerado
- [ ] 🔵 Criar campo de link de produto
- [ ] 🔵 Criar preenchimento automático ao colar link

### Testes de AI ✅
- [x] 🟡 Testar schemas de validação (48 testes)
- [x] 🟡 Testar services com mock da API (25 testes)
- [x] 🟡 Testar briefing (memorial, moodboard, reference)
- [x] 🟡 Testar brandbook generation
- [x] 🟡 Testar product extraction

---

## 📊 FASE 8: DASHBOARD

### Lógica do Dashboard ✅
- [x] 🟢 Criar lógica de estatísticas do dashboard (`dashboard.service.ts`)
- [x] 🟢 Criar função para calcular totais gerais (`getDashboardStats`)
- [x] 🟢 Criar função para listar projetos recentes (`getRecentProjects`)
- [x] 🟢 Criar função para calcular financeiro (`getFinanceSummary`)
- [x] 🟢 Criar endpoint de estatísticas (`GET /api/dashboard/stats`)
- [x] 🟢 Criar endpoint de projetos recentes (`GET /api/dashboard/projects/recent`)
- [x] 🟢 Criar endpoint de resumo financeiro (`GET /api/dashboard/finance/summary`)

### Tela do Dashboard ✅
- [x] 🔵 Criar página inicial (dashboard)
- [x] 🔵 Criar cards de estatísticas
- [x] 🔵 Card: total de projetos
- [x] 🔵 Card: valor total faturado
- [x] 🔵 Card: projetos entregues
- [x] 🔵 Card: projetos em andamento
- [x] 🔵 Criar lista de projetos recentes
- [x] 🔵 Criar ações rápidas

### Tela Financeira ✅
- [x] 🔵 Criar página financeira (`/dashboard/financeiro`)
- [x] 🔵 Criar resumo financeiro (5 cards: Saldo, Recebido, Pendente, Vencido, Despesas)
- [x] 🔵 Criar gráfico de receitas (recharts - bar chart horizontal)
- [x] 🔵 Criar filtro por período (Este Mês, Mês Anterior, 3 Meses, Ano, Personalizado)
- [x] 🔵 Criar tabela de entradas (Receita por Projeto)
- [x] 🔵 Criar breakdown por categoria (Receitas e Despesas com progress bars)

### Testes do Dashboard ✅
- [x] 🟡 Testar schemas de validação (23 testes em `schemas.test.ts`)
- [x] 🟡 Testar endpoints de estatísticas (28 testes em `api.test.ts`)
- [x] 🟡 Testar projetos recentes com filtros
- [x] 🟡 Testar resumo financeiro com período
- [ ] 🟡 Testar dashboard carrega corretamente (E2E - pendente frontend)

---

## 🚢 FASE 9: DEPLOY

### Polish de UX
- [ ] 🔵 Criar estados de carregamento em todas as páginas
- [ ] 🔵 Criar tratamento de erros global
- [ ] 🔵 Configurar notificações toast
- [ ] 🔵 Criar telas vazias (empty states)
- [ ] 🔵 Revisar responsividade mobile
- [ ] 🔵 Criar página 404
- [ ] 🔵 Criar página de erro 500

### Performance
- [ ] 🔵 Implementar carregamento lazy
- [ ] 🔵 Otimizar carregamento de imagens
- [ ] 🔵 Configurar cache de dados
- [ ] 🔵 Carregar componentes pesados sob demanda

### Deploy
- [ ] 🟣 Criar projeto na Vercel
- [ ] 🟣 Configurar variáveis de ambiente de produção
- [ ] 🟠 Configurar domínio customizado
- [ ] 🟣 Configurar Supabase de produção
- [ ] 🟠 Testar fluxos em produção

### Documentação
- [ ] 🟠 Atualizar README do projeto
- [ ] 🟠 Documentar endpoints da API
- [ ] 🟠 Criar guia de contribuição
- [ ] 🟠 Atualizar arquivo CLAUDE.md

---

## Como dividir entre 2 devs

**DEV 1 (Backend-focused):** 🟢 + 🟣
- Banco de dados e migrations
- Endpoints da API
- Lógicas de negócio
- Integrações com IA
- Geradores de documentos

**DEV 2 (Frontend-focused):** 🔵 + 🟠
- Páginas e layouts
- Componentes visuais
- Formulários e validações
- Polish de UI/UX
- Deploy e infraestrutura

**Ambos:** 🟡
- Testes (cada um testa o que construiu)

---

**Última atualização:** 2026-01-20 (Fases 2-3 + 5 Frontend completas + Fases 4-8 Backend completas - 640 testes)
