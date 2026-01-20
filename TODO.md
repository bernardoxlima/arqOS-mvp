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
- [x] 🟡 Testar validação do formulário de login (schemas.test.ts)
- [x] 🟡 Testar validação do formulário de cadastro (schemas.test.ts)
- [x] 🟡 Testar contexto de autenticação (context.test.tsx)
- [x] 🟡 Testar fluxo completo de login (auth.spec.ts - E2E)
- [x] 🟡 Testar fluxo completo de cadastro (auth.spec.ts - E2E)

---

## 📁 FASE 2: PROJETOS

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

### Lógica de Projetos
- [ ] 🟢 Criar lógica para listar projetos com filtros
- [ ] 🟢 Criar lógica para buscar projeto por id
- [ ] 🟢 Criar lógica para criar novo projeto
- [ ] 🟢 Criar lógica para atualizar projeto
- [ ] 🟢 Criar lógica para deletar projeto
- [ ] 🟢 Criar endpoint para listar projetos
- [ ] 🟢 Criar endpoint para criar projeto
- [ ] 🟢 Criar endpoint para buscar projeto específico
- [ ] 🟢 Criar endpoint para atualizar projeto
- [ ] 🟢 Criar endpoint para deletar projeto

### Lógica do Kanban
- [ ] 🟢 Criar lógica para mover projeto entre etapas
- [ ] 🟢 Criar lógica para registrar horas na etapa
- [ ] 🟢 Criar endpoint para mover etapa
- [ ] 🟢 Criar endpoint para adicionar etapa

### Tela de Lista de Projetos
- [ ] 🔵 Criar página de projetos
- [ ] 🔵 Criar cabeçalho da página
- [ ] 🔵 Criar botão alternar visualização Lista/Kanban
- [ ] 🔵 Criar card de projeto
- [ ] 🔵 Criar filtro por status
- [ ] 🔵 Criar busca por nome ou cliente
- [ ] 🔵 Criar tela vazia "nenhum projeto"

### Tela do Kanban
- [ ] 🔵 Criar visualização Kanban
- [ ] 🔵 Criar colunas por etapa
- [ ] 🔵 Implementar arrastar e soltar
- [ ] 🔵 Criar modal para informar horas ao mover
- [ ] 🔵 Criar indicador visual de progresso

### Tela de Detalhe do Projeto
- [ ] 🔵 Criar página de detalhe do projeto
- [ ] 🔵 Criar cabeçalho com nome e status
- [ ] 🔵 Criar seção com dados do cliente
- [ ] 🔵 Criar linha do tempo das etapas
- [ ] 🔵 Criar botões de editar e deletar

### Modais de Projeto
- [ ] 🔵 Criar modal de criar/editar projeto
- [ ] 🔵 Criar formulário (nome, cliente, fase)
- [ ] 🔵 Criar modal de confirmação de exclusão
- [ ] 🔵 Criar hook para gerenciar lista de projetos
- [ ] 🔵 Criar hook para gerenciar projeto individual

### Testes de Projetos
- [ ] 🟡 Testar lógica de projetos
- [ ] 🟡 Testar endpoints de projetos
- [ ] 🟡 Testar criar projeto
- [ ] 🟡 Testar mover no Kanban
- [ ] 🟡 Testar editar projeto

---

## 🧮 FASE 3: CALCULADORA

### Banco de Dados ✅
- [x] 🟢 Criar tabela de configuração de preços (`lookup_data`)
- [x] 🟢 Estrutura para tipo de serviço, faixa, preço base
- [x] 🟢 Estrutura para multiplicadores (JSONB)
- [ ] 🟢 Popular dados padrão de preços
- [ ] 🟢 Popular preços DecorExpress (P, M, G)
- [ ] 🟢 Popular preços ProjetExpress por m²
- [ ] 🟢 Popular multiplicadores (complexidade, acabamento)

### Lógica de Cálculo
- [ ] 🟢 Criar motor de cálculo de preços
- [ ] 🟢 Criar lógica de cálculo por m²
- [ ] 🟢 Criar lógica de cálculo por cômodo
- [ ] 🟢 Criar lógica de aplicar multiplicadores
- [ ] 🟢 Criar lógica de estimar horas
- [ ] 🟢 Criar endpoint para calcular orçamento
- [ ] 🟢 Criar endpoint para buscar configuração de preços

### Tela da Calculadora
- [ ] 🔵 Criar página de novo orçamento
- [ ] 🔵 Criar wizard de orçamento em etapas
- [ ] 🔵 Etapa 1: Dados do cliente (nome, telefone, email)
- [ ] 🔵 Etapa 2: Seleção do tipo de serviço
- [ ] 🔵 Etapa 3: Configuração de área (m² ou cômodos)
- [ ] 🔵 Etapa 4: Opções extras (multiplicadores)
- [ ] 🔵 Etapa 5: Resultado final com valor
- [ ] 🔵 Criar botão salvar orçamento
- [ ] 🔵 Criar botão gerar PDF
- [ ] 🔵 Criar hook para gerenciar calculadora

### Testes da Calculadora
- [ ] 🟡 Testar cálculo por m²
- [ ] 🟡 Testar cálculo por cômodo
- [ ] 🟡 Testar multiplicadores
- [ ] 🟡 Testar endpoint de cálculo
- [ ] 🟡 Testar fluxo completo da calculadora

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

### Lógica de Orçamentos
- [ ] 🟢 Criar lógica para listar orçamentos
- [ ] 🟢 Criar lógica para buscar orçamento com itens
- [ ] 🟢 Criar lógica para criar orçamento
- [ ] 🟢 Criar lógica para atualizar orçamento
- [ ] 🟢 Criar lógica para adicionar item ao orçamento
- [ ] 🟢 Criar lógica para atualizar item
- [ ] 🟢 Criar lógica para remover item
- [ ] 🟢 Criar endpoint para listar orçamentos
- [ ] 🟢 Criar endpoint para criar orçamento
- [ ] 🟢 Criar endpoint para buscar orçamento
- [ ] 🟢 Criar endpoint para atualizar orçamento
- [ ] 🟢 Criar endpoint para adicionar item
- [ ] 🟢 Criar endpoint para atualizar item
- [ ] 🟢 Criar endpoint para remover item

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

### Testes de Orçamentos
- [ ] 🟡 Testar lógica de orçamentos
- [ ] 🟡 Testar CRUD de itens
- [ ] 🟡 Testar criar orçamento
- [ ] 🟡 Testar adicionar itens
- [ ] 🟡 Testar exportar

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

### Lógica de Apresentações
- [ ] 🟢 Criar lógica para criar apresentação
- [ ] 🟢 Criar lógica para buscar apresentação completa
- [ ] 🟢 Criar lógica para atualizar apresentação
- [ ] 🟢 Criar lógica para upload de imagem
- [ ] 🟢 Criar lógica para deletar imagem
- [ ] 🟢 Criar lógica para adicionar item
- [ ] 🟢 Criar lógica para atualizar item
- [ ] 🟢 Criar endpoint para criar apresentação
- [ ] 🟢 Criar endpoint para buscar apresentação
- [ ] 🟢 Criar endpoint para atualizar apresentação
- [ ] 🟢 Criar endpoint para upload de imagem
- [ ] 🟢 Criar endpoint para deletar imagem
- [ ] 🟢 Criar endpoint para adicionar item

### Tela de Lista de Apresentações
- [ ] 🔵 Criar página de apresentações
- [ ] 🔵 Criar card de apresentação
- [ ] 🔵 Criar filtros e busca
- [ ] 🔵 Criar botão nova apresentação

### Tela da Apresentação - Tab Imagens
- [ ] 🔵 Criar página de detalhe da apresentação
- [ ] 🔵 Criar sistema de abas (6 abas)
- [ ] 🔵 Criar aba de Apresentação
- [ ] 🔵 Criar zona de upload de imagens
- [ ] 🔵 Criar seção Fotos Antes (max 4)
- [ ] 🔵 Criar seção Moodboard (max 1)
- [ ] 🔵 Criar seção Referências (max 6)
- [ ] 🔵 Criar seção Planta Baixa (max 1)
- [ ] 🔵 Criar seção Renders (max 10, min 1)
- [ ] 🔵 Criar formulário dados do cliente

### Tela da Apresentação - Tab Layout
- [ ] 🔵 Criar aba de Layout
- [ ] 🔵 Criar editor de planta baixa
- [ ] 🔵 Criar visualização da planta com itens
- [ ] 🔵 Criar marcadores numerados coloridos por categoria
- [ ] 🔵 Criar formulário de adicionar item de layout
- [ ] 🔵 Criar lista de itens de layout
- [ ] 🔵 Criar seção de itens complementares
- [ ] 🔵 Criar formulário de adicionar item complementar

### Tela da Apresentação - Tab Compras
- [ ] 🔵 Criar aba de Compras
- [ ] 🔵 Criar tabela com todos os itens
- [ ] 🔵 Criar filtro por ambiente
- [ ] 🔵 Criar filtro por categoria
- [ ] 🔵 Criar indicador de status (completo/pendente)
- [ ] 🔵 Criar botão gerar PPT de lista de compras

### Tela da Apresentação - Tab Detalhamento
- [ ] 🔵 Criar aba de Detalhamento
- [ ] 🔵 Criar visualização por categoria
- [ ] 🔵 Criar layout planta + itens lado a lado
- [ ] 🔵 Criar botão gerar PPT de detalhamento

### Tela da Apresentação - Tab Orçamento
- [ ] 🔵 Criar aba de Orçamento
- [ ] 🔵 Criar totais por categoria
- [ ] 🔵 Criar valor por m² por ambiente
- [ ] 🔵 Permitir edição inline de valores
- [ ] 🔵 Criar botão exportar Excel

### Tela da Apresentação - Tab Exportar
- [ ] 🔵 Criar aba de Exportar
- [ ] 🔵 Criar checklist de completude do projeto
- [ ] 🔵 Criar checkboxes para selecionar exports
- [ ] 🔵 Criar preview dos slides
- [ ] 🔵 Criar botão gerar todos os documentos

### Testes de Apresentações
- [ ] 🟡 Testar lógica de apresentações
- [ ] 🟡 Testar upload de imagens
- [ ] 🟡 Testar criar apresentação
- [ ] 🟡 Testar upload + adicionar itens

---

## 📄 FASE 6: DOCUMENTOS

### Lógica de Geração
- [ ] 🟢 Criar gerador de PowerPoint
- [ ] 🟢 Gerar PPT de apresentação (capa + renders)
- [ ] 🟢 Gerar PPT de lista de compras
- [ ] 🟢 Gerar PPT de orçamento
- [ ] 🟢 Gerar PPT de detalhamento técnico
- [ ] 🟢 Criar gerador de Excel
- [ ] 🟢 Gerar planilha de orçamento formatada
- [ ] 🟢 Criar gerador de PDF
- [ ] 🟢 Gerar proposta comercial em PDF
- [ ] 🟢 Criar gerador de Word
- [ ] 🟢 Gerar proposta comercial em Word

### Endpoints de Documentos
- [ ] 🟢 Criar endpoint para gerar PowerPoint
- [ ] 🟢 Criar endpoint para gerar Excel
- [ ] 🟢 Criar endpoint para gerar PDF
- [ ] 🟢 Criar endpoint para gerar Word

### Tela de Exportação
- [ ] 🔵 Criar botão de exportar com loading
- [ ] 🔵 Criar modal de opções de exportação
- [ ] 🔵 Integrar na aba Exportar das apresentações
- [ ] 🔵 Integrar na página de orçamentos
- [ ] 🔵 Criar feedback de download concluído

### Testes de Documentos
- [ ] 🟡 Testar cada gerador de documento
- [ ] 🟡 Testar endpoints retornam arquivo
- [ ] 🟡 Testar gerar e baixar documento

---

## 🤖 FASE 7: AI

### Configuração OpenRouter
- [ ] 🟣 Criar cliente de conexão com OpenRouter
- [ ] 🟣 Configurar variável de ambiente da API
- [ ] 🟣 Criar tratamento de erros da API
- [ ] 🟣 Criar tipos de resposta da IA

### AI para Briefing
- [ ] 🟣 Criar lógica de briefing com IA
- [ ] 🟣 Criar prompt para gerar memorial de briefing
- [ ] 🟣 Criar prompt para gerar descrição de moodboard
- [ ] 🟣 Criar prompt para gerar descrição de referência visual
- [ ] 🟣 Criar endpoint de briefing com IA

### AI para Brandbook
- [ ] 🟣 Criar lógica de brandbook com IA
- [ ] 🟣 Criar prompt para gerar brandbook completo
- [ ] 🟣 Criar endpoint de brandbook com IA

### AI para Extração de Produtos
- [ ] 🟣 Criar lógica de extração de produtos
- [ ] 🟣 Criar prompt para extrair dados de link de produto
- [ ] 🟣 Extrair: nome, preço, fornecedor, imagem
- [ ] 🟣 Criar endpoint de extração de produto

### Telas de AI
- [ ] 🔵 Criar modal de briefing com IA
- [ ] 🔵 Criar campo de texto para transcrição
- [ ] 🔵 Criar visualização do memorial gerado
- [ ] 🔵 Criar wizard de brandbook
- [ ] 🔵 Criar questionário em etapas
- [ ] 🔵 Criar visualização do brandbook gerado
- [ ] 🔵 Criar campo de link de produto
- [ ] 🔵 Criar preenchimento automático ao colar link

### Testes de AI
- [ ] 🟡 Testar lógicas com mock da API
- [ ] 🟡 Testar endpoints de AI
- [ ] 🟡 Testar usar briefing com IA

---

## 📊 FASE 8: DASHBOARD

### Lógica do Dashboard
- [ ] 🟢 Criar lógica de estatísticas do dashboard
- [ ] 🟢 Criar função para calcular totais gerais
- [ ] 🟢 Criar função para listar projetos recentes
- [ ] 🟢 Criar função para calcular financeiro
- [ ] 🟢 Criar endpoint de estatísticas
- [ ] 🟢 Criar endpoint de projetos recentes
- [ ] 🟢 Criar endpoint de resumo financeiro

### Tela do Dashboard
- [ ] 🔵 Criar página inicial (dashboard)
- [ ] 🔵 Criar cards de estatísticas
- [ ] 🔵 Card: total de projetos
- [ ] 🔵 Card: valor total faturado
- [ ] 🔵 Card: projetos entregues
- [ ] 🔵 Card: projetos em andamento
- [ ] 🔵 Criar lista de projetos recentes
- [ ] 🔵 Criar ações rápidas

### Tela Financeira
- [ ] 🔵 Criar página financeira
- [ ] 🔵 Criar resumo financeiro
- [ ] 🔵 Criar gráfico de receitas
- [ ] 🔵 Criar filtro por período
- [ ] 🔵 Criar tabela de entradas

### Testes do Dashboard
- [ ] 🟡 Testar cálculos de estatísticas
- [ ] 🟡 Testar endpoint de estatísticas
- [ ] 🟡 Testar dashboard carrega corretamente

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
- [ ] 🟠 Criar projeto na Vercel
- [ ] 🟠 Configurar variáveis de ambiente de produção
- [ ] 🟠 Configurar domínio customizado
- [ ] 🟠 Configurar Supabase de produção
- [ ] 🟠 Testar fluxos em produção

### Documentação
- [ ] 🟠 Atualizar README do projeto
- [ ] 🟠 Documentar endpoints da API
- [ ] 🟠 Criar guia de contribuição
- [ ] 🟠 Atualizar arquivo CLAUDE.md

---

## 📋 BACKLOG (Futuro)

- [ ] Colaboração em tempo real
- [ ] Histórico de versões dos projetos
- [ ] Notificações push
- [ ] Multi-tenancy (múltiplos escritórios)
- [ ] Integração com APIs de fornecedores
- [ ] Aplicativo mobile

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

**Última atualização:** 2026-01-20 (Fase 1 Auth concluída)
