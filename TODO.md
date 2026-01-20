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

## 🚀 FASE 0: SETUP

### Projeto Base
- [ ] 🟠 Inicializar projeto Next.js com TypeScript
- [ ] 🟠 Configurar Tailwind para estilização
- [ ] 🟠 Configurar linting e formatação de código
- [ ] 🟠 Definir estrutura de pastas do projeto
- [ ] 🟠 Criar arquivo de variáveis de ambiente exemplo
- [ ] 🟠 Configurar gitignore adequado

### Biblioteca de Componentes
- [ ] 🔵 Inicializar shadcn/ui no projeto
- [ ] 🔵 Adicionar componentes básicos (botão, card, input)
- [ ] 🔵 Adicionar componentes de modal e dropdown
- [ ] 🔵 Adicionar componentes de formulário
- [ ] 🔵 Adicionar componentes de navegação (tabs, accordion)
- [ ] 🔵 Adicionar componentes de tabela e loading
- [ ] 🔵 Adicionar componente de sidebar

### Conexão com Banco
- [ ] 🟢 Criar projeto no Supabase
- [ ] 🟢 Configurar conexão do frontend com Supabase
- [ ] 🟢 Configurar conexão server-side com Supabase
- [ ] 🟢 Criar middleware de autenticação
- [ ] 🟢 Gerar tipos TypeScript do banco

### Testes
- [ ] 🟡 Configurar framework de testes unitários
- [ ] 🟡 Configurar testes de componentes
- [ ] 🟡 Configurar testes end-to-end
- [ ] 🟡 Criar scripts de teste no package.json
- [ ] 🟡 Criar primeiro teste de sanidade

---

## 🔐 FASE 1: AUTH

### Banco de Dados
- [ ] 🟢 Criar tabela de perfis de usuário
- [ ] 🟢 Adicionar campos nome, email e role
- [ ] 🟢 Adicionar campo de foto de perfil
- [ ] 🟢 Criar regra: usuário só vê próprio perfil
- [ ] 🟢 Criar regra: usuário só edita próprio perfil
- [ ] 🟢 Criar perfil automático ao cadastrar

### Lógica de Autenticação
- [ ] 🟢 Criar lógica de callback após login
- [ ] 🟢 Criar função para buscar sessão atual
- [ ] 🟢 Criar função para buscar dados do usuário
- [ ] 🟢 Criar função de logout

### Tela de Login
- [ ] 🔵 Criar página de login
- [ ] 🔵 Criar formulário com email e senha
- [ ] 🔵 Criar página de cadastro
- [ ] 🔵 Criar formulário de cadastro (nome, email, senha)
- [ ] 🔵 Adicionar validação nos campos
- [ ] 🔵 Mostrar erros de validação
- [ ] 🔵 Adicionar loading nos botões

### Proteção de Rotas
- [ ] 🔵 Criar contexto de autenticação
- [ ] 🔵 Criar hook useAuth
- [ ] 🔵 Criar componente que protege páginas
- [ ] 🔵 Criar layout para páginas públicas (login, cadastro)
- [ ] 🔵 Criar layout para páginas protegidas (dashboard)
- [ ] 🔵 Redirecionar usuário não logado para login

### Testes de Auth
- [ ] 🟡 Testar validação do formulário de login
- [ ] 🟡 Testar validação do formulário de cadastro
- [ ] 🟡 Testar contexto de autenticação
- [ ] 🟡 Testar fluxo completo de login
- [ ] 🟡 Testar fluxo completo de cadastro

---

## 📁 FASE 2: PROJETOS

### Banco de Dados
- [ ] 🟢 Criar tabela de projetos
- [ ] 🟢 Adicionar campos nome, cliente, status
- [ ] 🟢 Adicionar campos fase, valor total, criado por
- [ ] 🟢 Adicionar campos de data (criação, atualização)
- [ ] 🟢 Criar tabela de etapas do projeto (Kanban)
- [ ] 🟢 Adicionar campos da etapa: nome, ordem, horas
- [ ] 🟢 Adicionar campo de conclusão da etapa
- [ ] 🟢 Criar regras de acesso aos projetos
- [ ] 🟢 Criar índice para busca por usuário
- [ ] 🟢 Criar índice para busca por status

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

### Banco de Dados
- [ ] 🟢 Criar tabela de configuração de preços
- [ ] 🟢 Adicionar campos tipo de serviço, faixa, preço base
- [ ] 🟢 Adicionar campo de multiplicadores
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

### Banco de Dados
- [ ] 🟢 Criar tabela de orçamentos
- [ ] 🟢 Adicionar campos id, projeto, status
- [ ] 🟢 Adicionar campo de dados do cliente (JSON)
- [ ] 🟢 Adicionar campos tipo de serviço, valor total
- [ ] 🟢 Criar tabela de itens do orçamento
- [ ] 🟢 Adicionar campos do item: nome, categoria, quantidade
- [ ] 🟢 Adicionar campos do item: preço, fornecedor
- [ ] 🟢 Adicionar campos do item: link, imagem
- [ ] 🟢 Criar regras de acesso aos orçamentos
- [ ] 🟢 Criar regras de acesso aos itens

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

### Banco de Dados
- [ ] 🟢 Criar tabela de apresentações
- [ ] 🟢 Adicionar campos id, projeto, nome, fase
- [ ] 🟢 Adicionar campo de dados do cliente (JSON)
- [ ] 🟢 Criar tabela de imagens da apresentação
- [ ] 🟢 Adicionar campos: seção, url, ordem
- [ ] 🟢 Criar tabela de itens da apresentação
- [ ] 🟢 Adicionar campos: nome, categoria, ambiente
- [ ] 🟢 Adicionar campo de posição na planta (JSON)
- [ ] 🟢 Adicionar campos: preço, fornecedor, link
- [ ] 🟢 Criar bucket de storage para imagens
- [ ] 🟢 Criar regras de acesso ao storage

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

**Última atualização:** 2024-01-20
