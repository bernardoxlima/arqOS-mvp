# PROMPT COMPLETO - SISTEMA DE ORÇAMENTOS PARA ARQUITETURA

## OBJETIVO
Criar uma calculadora de orçamentos para escritório de arquitetura com 3 serviços principais: DECOREXPRESS, PRODUZEXPRESS e PROJETEXPRESS. O sistema deve calcular valores automaticamente, salvar orçamentos, e gerar propostas em PDF/DOC.

---

## IDENTIDADE VISUAL

### Logo e Nome
- Nome do escritório: **ARQEXPRESS**
- Logo: `/public/arqexpress-logo.png`

### Cores do Sistema (usar HSL no index.css)
```css
:root {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 47.4% 11.2%;
  --secondary: 217.2 32.6% 17.5%;
  --muted: 217.2 32.6% 17.5%;
  --accent: 217.2 32.6% 17.5%;
}
```

---

## VALOR DA HORA BASE

```typescript
export const HOUR_VALUE = 200; // Valor por hora em R$
```

---

## TABELA DE PREÇOS - DECOREXPRESS

Serviço de decoração e ambientação.

### Multiplicadores por Tipo de Ambiente

| Tipo | Nome | Multiplicador |
|------|------|---------------|
| standard | Básico | 1.0 |
| medium | Médio | 1.3 |
| high | Alto Padrão | 1.6 |

### Multiplicadores por Tamanho

| Tamanho | Nome | Multiplicador | Descrição |
|---------|------|---------------|-----------|
| P | Pequeno | 0.8 | Até 50m² |
| M | Médio | 1.0 | 50-100m² |
| G | Grande | 1.2 | Acima de 100m² |

### Preços Base por Quantidade de Ambientes

```typescript
export const decorExpressPricing = {
  '1amb': {
    name: '1 Ambiente',
    baseRange: '1',
    decor1: { price: 1800, hours: 9, description: 'Consultoria Básica' },
    decor2: { price: 2500, hours: 12.5, description: 'Projeto Completo' },
    decor3: { price: 3200, hours: 16, description: 'Premium + Acompanhamento' },
  },
  '2amb': {
    name: '2 Ambientes',
    baseRange: '2',
    decor1: { price: 2800, hours: 14, description: 'Consultoria Básica' },
    decor2: { price: 3800, hours: 19, description: 'Projeto Completo' },
    decor3: { price: 4800, hours: 24, description: 'Premium + Acompanhamento' },
  },
  '3amb': {
    name: '3 Ambientes',
    baseRange: '3',
    decor1: { price: 3600, hours: 18, description: 'Consultoria Básica' },
    decor2: { price: 4800, hours: 24, description: 'Projeto Completo' },
    decor3: { price: 6000, hours: 30, description: 'Premium + Acompanhamento' },
  },
  '4amb': {
    name: '4 Ambientes',
    baseRange: '4',
    decor1: { price: 4200, hours: 21, description: 'Consultoria Básica' },
    decor2: { price: 5600, hours: 28, description: 'Projeto Completo' },
    decor3: { price: 7000, hours: 35, description: 'Premium + Acompanhamento' },
  },
  '5amb': {
    name: '5 Ambientes',
    baseRange: '5',
    decor1: { price: 4800, hours: 24, description: 'Consultoria Básica' },
    decor2: { price: 6400, hours: 32, description: 'Projeto Completo' },
    decor3: { price: 8000, hours: 40, description: 'Premium + Acompanhamento' },
  },
};
```

### Níveis de Complexidade DECOREXPRESS
- **decor1**: Consultoria Básica - Orientação e indicações
- **decor2**: Projeto Completo - Projeto detalhado com especificações
- **decor3**: Premium + Acompanhamento - Projeto completo com acompanhamento de execução

---

## TABELA DE PREÇOS - PRODUZEXPRESS

Serviço de produção e execução de projetos.

### Preços Base por Quantidade de Ambientes

```typescript
export const producaoPricing = {
  '1amb': {
    name: '1 Ambiente',
    baseRange: '1',
    prod1: { price: 1200, hours: 6, description: 'Produção Simples' },
    prod3: { price: 2000, hours: 10, description: 'Produção Completa' },
  },
  '2amb': {
    name: '2 Ambientes',
    baseRange: '2',
    prod1: { price: 1800, hours: 9, description: 'Produção Simples' },
    prod3: { price: 3000, hours: 15, description: 'Produção Completa' },
  },
  '3amb': {
    name: '3 Ambientes',
    baseRange: '3',
    prod1: { price: 2400, hours: 12, description: 'Produção Simples' },
    prod3: { price: 4000, hours: 20, description: 'Produção Completa' },
  },
  '4amb': {
    name: '4 Ambientes',
    baseRange: '4',
    prod1: { price: 2800, hours: 14, description: 'Produção Simples' },
    prod3: { price: 4600, hours: 23, description: 'Produção Completa' },
  },
  '5amb': {
    name: '5 Ambientes',
    baseRange: '5',
    prod1: { price: 3200, hours: 16, description: 'Produção Simples' },
    prod3: { price: 5200, hours: 26, description: 'Produção Completa' },
  },
};
```

### Níveis de Complexidade PRODUZEXPRESS
- **prod1**: Produção Simples - Acompanhamento básico
- **prod3**: Produção Completa - Acompanhamento completo com gestão

---

## TABELA DE PREÇOS - PROJETEXPRESS

Projeto de apartamento completo baseado em metragem.

### Preços por m² - Apartamento Novo

```typescript
projetExpressPricing: {
  novo: {
    name: 'Apartamento Novo',
    ranges: [
      { min: 0, max: 50, pricePerM2: 120, hours: 30 },
      { min: 51, max: 100, pricePerM2: 100, hours: 50 },
      { min: 101, max: 150, pricePerM2: 90, hours: 70 },
      { min: 151, max: 200, pricePerM2: 80, hours: 90 },
      { min: 201, max: 999, pricePerM2: 70, hours: 110 },
    ],
  },
  reforma: {
    name: 'Reforma',
    ranges: [
      { min: 0, max: 50, pricePerM2: 150, hours: 40 },
      { min: 51, max: 100, pricePerM2: 130, hours: 65 },
      { min: 101, max: 150, pricePerM2: 115, hours: 90 },
      { min: 151, max: 200, pricePerM2: 100, hours: 115 },
      { min: 201, max: 999, pricePerM2: 90, hours: 140 },
    ],
  },
}
```

---

## EXTRAS E ADICIONAIS

### Ambientes Extras
- **Valor por ambiente extra**: R$ 800,00
- **Horas por ambiente extra**: 4 horas

### Taxa de Visita/Levantamento (Serviço Presencial)
- Aplicável quando modalidade = "presencial"
- Valor configurável pelo usuário
- Horas adicionais: (taxaVisita / HOUR_VALUE)

### Gerenciamento de Obra (PROJETEXPRESS)
- Opcional
- Taxa configurável pelo usuário (ex: 10% do valor da obra)

---

## DESCONTOS

### Pagamento à Vista
- Desconto configurável de 0% a 20%
- Slider para selecionar porcentagem

### Pagamento Parcelado
- Sem desconto aplicado

---

## LÓGICA DE CÁLCULO

### DECOREXPRESS e PRODUZEXPRESS

```typescript
// 1. Obter preço base pela quantidade de ambientes e nível de complexidade
const basePrice = pricingData[ambientes][complexidade].price;

// 2. Calcular multiplicador médio dos ambientes configurados
// Para cada ambiente:
//   - Multiplicador de tipo (standard=1.0, medium=1.3, high=1.6)
//   - Multiplicador de tamanho (P=0.8, M=1.0, G=1.2)
//   - Multiplicador combinado = tipo × tamanho

const avgMultiplier = média dos multiplicadores combinados;

// 3. Aplicar multiplicador ao preço base
const priceAfterMultiplier = basePrice * avgMultiplier;

// 4. Adicionar extras
const extrasTotal = ambientesExtras * 800;

// 5. Adicionar taxa de visita (se presencial)
const surveyFeeTotal = modalidade === 'presencial' ? taxaVisita : 0;

// 6. Calcular preço final antes do desconto
const finalPrice = priceAfterMultiplier + extrasTotal + surveyFeeTotal;

// 7. Aplicar desconto (se pagamento à vista)
const discount = finalPrice * (descontoPercentual / 100);
const priceWithDiscount = finalPrice - discount;

// 8. Calcular horas máximas
const horasMaximas = priceWithDiscount / HOUR_VALUE;
```

### PROJETEXPRESS

```typescript
// 1. Encontrar faixa de preço pela metragem
const range = ranges.find(r => area >= r.min && area <= r.max);

// 2. Calcular preço base
const basePrice = area * range.pricePerM2;

// 3. Adicionar taxa de visita (se presencial)
const surveyFeeTotal = modalidade === 'presencial' ? taxaVisita : 0;

// 4. Adicionar gerenciamento (se incluído)
const managementTotal = incluirGerenciamento ? taxaGerenciamento : 0;

// 5. Calcular preço final
const finalPrice = basePrice + surveyFeeTotal + managementTotal;

// 6. Aplicar desconto
const discount = finalPrice * (descontoPercentual / 100);
const priceWithDiscount = finalPrice - discount;

// 7. Calcular horas máximas
const horasMaximas = priceWithDiscount / HOUR_VALUE;
```

---

## DISPLAY DE HORAS MÁXIMAS

O sistema calcula automaticamente as horas máximas que a arquiteta pode usar no projeto:

```
HORAS MÁXIMAS = Valor Final com Desconto ÷ R$ 200 (valor hora)
```

- Se entregar dentro do tempo: **Eficiência Ótima ✓**

---

## FUNCIONALIDADES DO SISTEMA

### 1. Seletor de Serviço
- 3 cards clicáveis: DECOREXPRESS, PRODUZEXPRESS, PROJETEXPRESS
- Ícones: Home, Wrench, FileText

### 2. Formulário do Cliente
- Nome do cliente (obrigatório para salvar)
- Telefone
- Email
- Observações do projeto

### 3. Configuração por Serviço

**DECOREXPRESS/PRODUZEXPRESS:**
- Quantidade de ambientes (1-5)
- Nível de complexidade (decor1/2/3 ou prod1/3)
- Configuração individual de cada ambiente (tipo e tamanho)
- Ambientes extras
- Modalidade (online/presencial)
- Tipo de pagamento (à vista/parcelado)
- Desconto (0-20%)

**PROJETEXPRESS:**
- Tipo de projeto (novo/reforma)
- Metragem do apartamento
- Modalidade (online/presencial)
- Gerenciamento de obra (sim/não)
- Tipo de pagamento (à vista/parcelado)
- Desconto (0-20%)

### 4. Display de Resultados
- Preço base
- Multiplicador médio (para decor/produção)
- Detalhes por ambiente
- Extras
- Taxa de visita
- Desconto
- **Valor Final**
- **Horas Máximas**

### 5. Orçamentos Salvos
- Lista de orçamentos salvos com localStorage
- Carregar orçamento existente
- Excluir orçamento
- Exportar para PDF
- Exportar para DOC

### 6. Tabela de Referência
- Mostra todas as tabelas de preços
- Multiplicadores por tipo e tamanho
- Preços por m² do PROJETEXPRESS

---

## GERAÇÃO DE PROPOSTAS

### PDF (jspdf)
- Logo do escritório
- Data e local
- Dados do cliente
- Tabela com descrição do serviço e valores
- Desconto (se aplicável)
- Valor total
- Observações
- Espaço para assinaturas
- Validade da proposta

### DOC (docx)
- Mesmo conteúdo do PDF
- Formato editável

---

## TECNOLOGIAS UTILIZADAS

- React + TypeScript + Vite
- Tailwind CSS
- shadcn/ui components
- lucide-react (ícones)
- jspdf (geração PDF)
- docx + file-saver (geração DOC)
- localStorage (persistência de orçamentos)

---

## ESTRUTURA DE ARQUIVOS PRINCIPAL

```
src/
├── components/
│   └── calculator/
│       ├── PricingCalculator.tsx (componente principal)
│       ├── ServiceSelector.tsx
│       ├── ClientForm.tsx
│       ├── DecorConfig.tsx
│       ├── ProjetConfig.tsx
│       ├── ResultDisplay.tsx
│       ├── SavedBudgets.tsx
│       ├── ReferenceTable.tsx
│       └── Header.tsx
├── data/
│   └── pricingData.ts (tabelas de preços)
├── types/
│   └── budget.ts (interfaces TypeScript)
├── utils/
│   ├── pdfGenerator.ts
│   └── docGenerator.ts
└── pages/
    └── Index.tsx
```

---

## PARA PERSONALIZAR PARA OUTRO ESCRITÓRIO

1. **Trocar logo**: Substituir `/public/arqexpress-logo.png`
2. **Trocar nome**: Buscar "ARQEXPRESS" e substituir
3. **Ajustar cores**: Editar variáveis CSS em `index.css`
4. **Ajustar preços**: Editar `pricingData.ts`
5. **Ajustar valor hora**: Alterar `HOUR_VALUE`
6. **Ajustar multiplicadores**: Editar objetos de multiplicadores
7. **Ajustar texto das propostas**: Editar `pdfGenerator.ts` e `docGenerator.ts`

---

## EXEMPLO DE USO

1. Usuário seleciona "DECOREXPRESS"
2. Preenche nome do cliente: "Maria Silva"
3. Seleciona 3 ambientes, nível decor2
4. Configura cada ambiente:
   - Ambiente 1: Médio, Tamanho M
   - Ambiente 2: Alto Padrão, Tamanho G
   - Ambiente 3: Básico, Tamanho P
5. Modalidade: Presencial, Taxa: R$ 200
6. Pagamento: À vista, 10% desconto
7. Sistema calcula:
   - Preço base: R$ 4.800
   - Multiplicador médio: 1.13
   - Preço ajustado: R$ 5.424
   - Taxa visita: R$ 200
   - Total: R$ 5.624
   - Desconto 10%: -R$ 562,40
   - **Valor Final: R$ 5.061,60**
   - **Horas Máximas: 25,3h**
8. Salva orçamento
9. Exporta PDF para enviar ao cliente
