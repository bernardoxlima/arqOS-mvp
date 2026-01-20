import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { answers } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `Você é um estrategista de marca especializado em escritórios de arquitetura. Com base nas respostas abaixo, gere um BRANDBOOK COMPLETO E PERSONALIZADO.

## RESPOSTAS DO QUESTIONÁRIO:

${JSON.stringify(answers, null, 2)}

## GERE O BRANDBOOK NO SEGUINTE FORMATO (use markdown):

# BRANDBOOK ${answers.identity?.name || '[NOME DO ESCRITÓRIO]'}

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

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Por favor, adicione créditos à sua conta." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const generatedBrandbook = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ brandbook: generatedBrandbook }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("brand-architecture-ai error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
