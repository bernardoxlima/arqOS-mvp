/**
 * Brandbook AI Prompts
 *
 * System prompt for generating complete brandbook from questionnaire answers.
 */

import type { BrandbookAnswers } from '../types';

/**
 * Generate Brandbook System Prompt
 * Creates a complete brandbook from questionnaire answers
 */
export function getBrandbookPrompt(answers: BrandbookAnswers): string {
  const firmName = answers.identity?.name || '[NOME DO ESCRITÓRIO]';

  return `Você é um estrategista de marca especializado em escritórios de arquitetura. Com base nas respostas abaixo, gere um BRANDBOOK COMPLETO E PERSONALIZADO.

## RESPOSTAS DO QUESTIONÁRIO:

${JSON.stringify(answers, null, 2)}

## GERE O BRANDBOOK NO SEGUINTE FORMATO (use markdown):

# BRANDBOOK ${firmName}

## PARTE 1: FUNDAMENTOS

### TESE
[Uma frase poderosa que sintetiza a grande ideia que move o negócio]

### PROPÓSITO
[Por que o escritório existe além do lucro - 2-3 frases]

### MISSÃO
[O que faz + para quem + como - formato: "Verbo + entrega + para quem + como"]

### VISÃO
[Onde quer chegar em 5 anos - ambição clara e específica]

### VALORES
**Valor Central:**
1. [Nome do valor]: [Descrição]

**Valores Operacionais:**
2. [Nome]: [Descrição curta]
3. [Nome]: [Descrição curta]
4. [Nome]: [Descrição curta]
5. [Nome]: [Descrição curta]

---

## PARTE 2: POSICIONAMENTO

### PROPOSTA ÚNICA DE VALOR
[Frase que resume o diferencial - o que entrega + como + resultado]

### PROMESSA DE MARCA
[O que o cliente SEMPRE pode esperar - 3-5 palavras]

### FRASE PROPRIETÁRIA (Tagline)
[Máximo 5 palavras - a assinatura da marca]

### ASSINATURA
[Frase de impacto para comunicação]

---

## PARTE 3: SÍNTESE DE POSICIONAMENTO

### QUEM EU SOU
[1-2 frases definindo a identidade]

### PARA QUEM EU PROJETO
[1-2 frases definindo o público]

### O QUE EU DEFENDO
[1-2 frases definindo a bandeira/crença]

---

## PARTE 4: VOZ DA MARCA

### TOM DE VOZ
[4 adjetivos que definem como a marca fala]

**Exemplos de como falar:**
- "[Exemplo de frase no tom da marca]"
- "[Exemplo de frase no tom da marca]"
- "[Exemplo de frase no tom da marca]"

### PALAVRAS QUE USA
[Lista de 8-10 termos alinhados à marca]

### PALAVRAS QUE EVITA
[Lista de 6-8 termos que a marca nunca usa]

### MENSAGENS ESTRATÉGICAS
| Contexto | Mensagem |
|----------|----------|
| Velocidade | "[frase]" |
| Qualidade | "[frase]" |
| Processo | "[frase]" |
| Transformação | "[frase]" |
| Acessibilidade | "[frase]" |

---

## PARTE 5: MANIFESTO

### Versão Curta
[1 parágrafo poderoso - 4-5 frases]

### Versão Completa
[3-5 parágrafos contando a história e crença da marca]

---

## PARTE 6: DIRETRIZES

### O QUE A MARCA SEMPRE FAZ
- [Diretriz 1]
- [Diretriz 2]
- [Diretriz 3]
- [Diretriz 4]
- [Diretriz 5]
- [Diretriz 6]

### O QUE A MARCA NUNCA FAZ
- [Diretriz 1]
- [Diretriz 2]
- [Diretriz 3]
- [Diretriz 4]
- [Diretriz 5]
- [Diretriz 6]

---

IMPORTANTE:
- Use as PALAVRAS do arquiteto nas respostas
- Seja ESPECÍFICO para este escritório (nada genérico)
- Mantenha a ESSÊNCIA e personalidade que ele descreveu
- Crie algo que ele se RECONHEÇA
- Tudo deve ser APLICÁVEL no dia a dia`;
}
