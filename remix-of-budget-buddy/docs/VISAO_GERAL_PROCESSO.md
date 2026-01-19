# 📋 ARQEXPRESS - Visão Geral do Processo de Gestão de Projetos

## 🎯 Objetivo do Sistema

O sistema ARQEXPRESS gerencia todo o ciclo de vida de projetos de arquitetura e design de interiores, desde a geração do orçamento até a entrega final ao cliente, incluindo controle de timesheet e prazos.

---

## 🔄 Fluxo Geral do Processo

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  1. ORÇAMENTO   │ -> │  2. ATRIBUIÇÃO  │ -> │  3. CRONOGRAMA  │ -> │   4. KANBAN     │
│   Calculadora   │    │   Arquiteta +   │    │   Prazos auto   │    │  Gestão etapas  │
│   de preços     │    │   Squad + Data  │    │   calculados    │    │  + Timesheet    │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 📊 Etapa 1: Geração do Orçamento

### Serviços Disponíveis

| Serviço | Descrição | Modalidade |
|---------|-----------|------------|
| **DecorExpress** | Projeto de interiores 3D + Manual | Online ou Presencial |
| **ProduzExpress** | Dia de produção presencial | Presencial |
| **ProjetExpress** | Projeto executivo completo | Presencial |

### Dados Coletados
- **Cliente**: Nome, telefone, e-mail
- **Serviço**: Tipo e complexidade
- **Ambientes**: Quantidade e tamanho
- **Extras**: Visita técnica, gerenciamento, etc.
- **Desconto**: Pagamento à vista (5% ou 10%)

### Saída
- Valor total calculado
- Horas estimadas do projeto
- PDF/DOC do orçamento para envio ao cliente

---

## 👥 Etapa 2: Atribuição do Projeto

Quando o cliente aceita o orçamento:

### Campos Obrigatórios
- **Arquiteta Responsável**: Profissional que liderará o projeto
- **Squad**: Equipe de apoio
- **Data do Briefing**: Primeira reunião com cliente

### Código do Projeto
Gerado automaticamente: `ARQ-XXXXXX` (6 dígitos)

---

## 📅 Etapa 3: Cronograma Automático

O sistema calcula automaticamente:

### Prazos por Serviço

#### DecorExpress Presencial
| Etapa | Dias Úteis |
|-------|------------|
| Formulário Pré-Briefing | 2 |
| Visita Técnica | 1 |
| Reunião de Briefing | 1 |
| Desenvolvimento Projeto 3D | 10 |
| Reunião Projeto 3D | 1 |
| Ajuste 3D | 3 |
| Aprovação Projeto 3D | 1 |
| Desenvolvimento Manual | 5 |
| Reunião Manual | 1 |
| Ajustes Manual | 2 |
| Reunião Final | 1 |
| Entrega | 1 |
| Gerenciamento | 15 |
| Montagem Final | 2 |
| Pesquisa de Satisfação | 1 |
| **TOTAL** | **~47 dias úteis** |

#### DecorExpress Online
| Etapa | Dias Úteis |
|-------|------------|
| Formulário Pré-Briefing | 2 |
| Reunião de Briefing | 1 |
| Desenvolvimento Projeto 3D | 10 |
| Reunião Projeto 3D | 1 |
| Ajuste 3D | 3 |
| Aprovação Projeto 3D | 1 |
| Desenvolvimento Manual | 5 |
| Reunião Manual | 1 |
| Ajustes Manual | 2 |
| Reunião Final | 1 |
| Entrega | 1 |
| Pesquisa de Satisfação | 1 |
| **TOTAL** | **~29 dias úteis** |

#### ProduzExpress
| Etapa | Dias Úteis |
|-------|------------|
| Pagamento | 1 |
| Questionário Pré-Briefing | 2 |
| Reunião de Briefing | 1 |
| Dia de Produção | 1 |
| Ambiente Finalizado | 1 |
| **TOTAL** | **~6 dias úteis** |

#### ProjetExpress
| Etapa | Dias Úteis |
|-------|------------|
| Pagamento | 1 |
| Questionário Pré-Briefing | 3 |
| Visita Técnica + Medição | 1 |
| Reunião de Briefing | 1 |
| Desenvolvimento Projeto 3D | 15 |
| Reunião Apresentação 3D | 1 |
| Desenvolvimento Executivo | 10 |
| Reunião Entrega Executivo | 1 |
| Entrega Final | 1 |
| **TOTAL** | **~34 dias úteis** |

### Reuniões com Cliente (Destacadas)
O cronograma identifica automaticamente as **reuniões com cliente** para facilitar o agendamento:
- 🔵 Reunião de Briefing
- 🔵 Reunião Projeto 3D
- 🔵 Reunião Manual
- 🔵 Reunião Final
- 🔵 Reunião Apresentação 3D
- 🔵 Reunião Entrega Executivo

---

## 📌 Etapa 4: Kanban de Gestão

### Funcionalidades

1. **Visualização por Colunas**: Cada etapa é uma coluna no Kanban
2. **Filtro por Serviço**: Ver apenas DecorExpress, ProduzExpress ou ProjetExpress
3. **Avançar Etapa**: Botão rápido para mover projeto para próxima fase
4. **Registro de Horas**: Ao avançar, registra horas gastas na etapa

### Etapas por Serviço

#### 🎨 DecorExpress (Presencial)
```
Formulário → Visita Técnica → Briefing → 3D → Reunião 3D → Ajuste 3D → 
Aprovação → Manual → Reunião Manual → Ajuste Manual → Reunião Final → 
Entrega → Gerenciamento → Montagem Final → Pesquisa
```

#### 🎨 DecorExpress (Online)
```
Formulário → Briefing → 3D → Reunião 3D → Ajuste 3D → Aprovação → 
Manual → Reunião Manual → Ajuste Manual → Reunião Final → Entrega → Pesquisa
```

#### 🛋️ ProduzExpress
```
Pagamento → Questionário → Briefing → Dia de Produção → Finalizado
```

#### 📐 ProjetExpress
```
Pagamento → Questionário → Visita + Medição → Briefing → 3D → 
Apresentação 3D → Executivo → Entrega Executivo → Entrega Final
```

---

## ⏱️ Timesheet

### Registro de Horas
Cada avanço de etapa registra:
- **Etapa concluída**
- **Horas gastas**
- **Descrição do trabalho**
- **Data do registro**

### Métricas Disponíveis
- Total de horas por projeto
- Valor/hora médio
- Comparativo: Horas estimadas vs. Horas gastas
- Horas restantes do projeto

---

## 📊 Dashboard de Projetos

### Indicadores
- **Projetos Ativos**: Em andamento
- **Projetos Concluídos**: Finalizados
- **Valor/Hora Médio**: Rentabilidade
- **Total de Horas**: Acumulado

### Abas
1. **Kanban**: Gestão visual das etapas
2. **Pendentes**: Orçamentos aguardando início
3. **Timesheet**: Registro de horas por projeto

---

## 🔐 Equipe

### Arquitetas
- Larissa (SP)
- Luiza
- Elo
- Ana Silva
- Beatriz Santos
- Carla Oliveira

### Squads
- Squad Alpha
- Squad Beta
- Squad Gamma
- Squad Delta

---

## 💰 Precificação Base

| Parâmetro | Valor |
|-----------|-------|
| **Valor/Hora** | R$ 200,00 |
| **Desconto à vista (1x)** | 10% |
| **Desconto à vista (2x)** | 5% |

---

## 📤 Exportações

### Disponíveis
- **PDF do Orçamento**: Para envio ao cliente
- **DOC do Orçamento**: Editável
- **Cronograma**: Datas e prazos do projeto

---

## 🔄 Status do Projeto

| Status | Descrição |
|--------|-----------|
| `aguardando` | Orçamento aprovado, aguardando início |
| `em_andamento` | Projeto em execução no Kanban |
| `finalizado` | Todas as etapas concluídas |

---

## 📱 Próximos Passos

- [ ] Integrar com banco de dados para persistência
- [ ] Notificações de prazo
- [ ] Relatórios gerenciais
- [ ] App mobile para arquitetas
- [ ] Integração com calendário (Google Calendar)

---

*Documento gerado para o sistema ARQEXPRESS - Gestão de Projetos de Arquitetura*
