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
    const { type, transcription, memorial, clientName, projectCode, architectName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (type === "memorial") {
      // Generate structured briefing document from transcription
      const systemPrompt = `Você é um sistema especializado em transformar transcrições de briefings de arquitetura e design de interiores em documentos estruturados profissionais.

Sua função é receber a transcrição de uma reunião de briefing e gerar um MAPA DE BRIEFING estruturado seguindo o formato abaixo.

## PROCESSO DE EXTRAÇÃO
Ao receber a transcrição, extraia e organize:

1. **IDENTIFICAÇÃO**
   - Nome do projeto (tipo de ambiente)
   - Nome do cliente
   - Nome do arquiteto(a)
   - Objetivo principal

2. **VISÃO E SENSAÇÃO**
   - Citação marcante do cliente sobre o que deseja sentir
   - 3 pilares principais (ex: sofisticação, aconchego, praticidade)

3. **ESTILO**
   - Estilo preferido (contemporâneo, minimalista, clássico, etc.)
   - Elementos que transmitem luxo/qualidade para o cliente
   - Paleta de cores mencionada

4. **USO DO ESPAÇO**
   - Zonas/setores do ambiente
   - Frequência de uso
   - Quantidade de pessoas
   - Atividades realizadas

5. **MOBILIÁRIO PRIORITÁRIO**
   - Item #1 (geralmente o mais importante para o cliente)
   - Item #2 (elemento de personalidade/destaque)
   - Especificações de cada: formato, material, cor, função

6. **ELEMENTOS SECUNDÁRIOS**
   - Mesa (se aplicável)
   - Iluminação
   - Outros móveis mencionados

7. **ESTRUTURA FIXA**
   - Marcenaria
   - Painéis
   - Estantes
   - Acabamentos

8. **DECORAÇÃO**
   - Estilo decorativo desejado
   - Tipos de objetos
   - Arte/quadros
   - Plantas

9. **FUNCIONALIDADE**
   - Necessidades de organização
   - Automação
   - Armazenamento

10. **RESTRIÇÕES**
    - O que o cliente NÃO quer
    - O que evitar

11. **PRÓXIMOS PASSOS**
    - Ações acordadas

## FORMATO DE SAÍDA

Gere o documento no seguinte formato estruturado:

---
# BRIEFING DE PROJETO

## ${projectCode || 'PROJETO'} - [NOME DO AMBIENTE]

**CLIENTE:** ${clientName || '[Nome do Cliente]'}
**ARQUITETA:** ${architectName || '[Nome]'}
**DATA:** ${new Date().toLocaleDateString('pt-BR')}
**OBJETIVO:** [Objetivo principal extraído]

---

## 1. VISÃO GERAL

> "[Citação marcante do cliente sobre o que deseja sentir]"
> — ${clientName || 'Cliente'}

### Três Pilares do Projeto:
| PILAR 1 | PILAR 2 | PILAR 3 |
|---------|---------|---------|
| [Descrição] | [Descrição] | [Descrição] |

---

## 2. ESTILO E CORES

### Estilo: [ESTILO IDENTIFICADO]
- [Característica 1]
- [Característica 2]
- [Característica 3]

### Elementos de Luxo:
- [Elemento 1]
- [Elemento 2]
- [Elemento 3]

### Paleta de Cores:
| COR 1 | COR 2 | COR 3 | COR 4 |
|-------|-------|-------|-------|
| [Nome] | [Nome] | [Nome] | [Nome] |

[Observação sobre cores de destaque]

---

## 3. LAYOUT DO ESPAÇO

### [Zona 1 - Ex: SALA DE ESTAR]
- [Item 1]
- [Item 2]
- [Item 3]

### [Zona 2 - Ex: SALA DE JANTAR]
- [Item 1]
- [Item 2]
- [Item 3]

### Estatísticas de Uso:
| USO DIÁRIO | PESSOAS | ATIVIDADES |
|------------|---------|------------|
| [Freq] | [Qtd] | [Lista] |

---

## 4. ELEMENTOS PRINCIPAIS

### ITEM PRIORIDADE #1: [NOME]
| Especificação | Detalhe |
|---------------|---------|
| FORMATO | [Detalhe] |
| MATERIAL | [Detalhe] |
| COR | [Detalhe] |
| FUNÇÃO | [Detalhe] |

### ITEM PRIORIDADE #2: [NOME]
| Especificação | Detalhe |
|---------------|---------|
| FORMATO | [Detalhe] |
| MATERIAL | [Detalhe] |
| COR | [Detalhe] |
| FUNÇÃO | [Detalhe] |

---

## 5. DETALHAMENTO

### Mesa/Superfícies
| ESPECIFICAÇÃO | DETALHE |
|---------------|---------|
| TAMPO | [Material] |
| BASE | [Material] |
| FORMATO | [Formato] |

### Iluminação
| ESPECIFICAÇÃO | DETALHE |
|---------------|---------|
| TEMPERATURA | [Quente/Fria] |
| TIPO PRINCIPAL | [Pendentes/Trilho/etc] |
| EFEITOS | [Luz indireta/etc] |

---

## 6. MARCENARIA E ESTRUTURA

### Elemento Principal:
[Descrição do elemento de marcenaria mais importante]

### Composição:
- [Item 1]
- [Item 2]
- [Item 3]

---

## 7. DECORAÇÃO E FUNCIONALIDADE

### Decoração
- **Estilo:** [Minimalista/Cheio/etc]
- **Objetos:** [Tipos permitidos]
- **Arte:** [Estilo de quadros/arte]
- **Plantas:** [Se sim, tipo]

### Organização
- [Necessidade 1]
- [Necessidade 2]

### Automação (se houver):
[Detalhe da automação desejada]

---

## 8. RESUMO EXECUTIVO

### ⬛ TOP 5 PRIORIDADES:
1. [Prioridade 1]
2. [Prioridade 2]
3. [Prioridade 3]
4. [Prioridade 4]
5. [Prioridade 5]

### ⬜ O QUE EVITAR:
- [Evitar 1]
- [Evitar 2]
- [Evitar 3]

### PRÓXIMOS PASSOS:
1. [Passo 1]
2. [Passo 2]
3. [Passo 3]

---

**CLIENTE:** ${clientName || '[Nome]'} | **ARQUITETA:** ${architectName || '[Nome]'} | **DATA:** ${new Date().toLocaleDateString('pt-BR')}

---

Seja objetivo, profissional e organize as informações de forma clara. Se alguma informação não foi mencionada na transcrição, indique "A definir" ou "Não especificado".
Remova acentos dos títulos principais para manter consistência visual.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Transcrição do briefing/reunião:\n\n${transcription}` }
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
      const generatedMemorial = data.choices?.[0]?.message?.content || "";

      return new Response(JSON.stringify({ memorial: generatedMemorial }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (type === "moodboard") {
      // Generate Moodboard prompt from memorial - Flat Lay Style
      const systemPrompt = `Você é um especialista em design de interiores e arquitetura, especializado em criar prompts detalhados para geração de imagens de moodboard no estilo FLAT LAY EDITORIAL.

Com base no memorial de briefing fornecido, crie um prompt em INGLÊS otimizado para ferramentas de IA generativa (Midjourney, DALL-E, Leonardo.ai) que gere um moodboard no estilo FLAT LAY.

O prompt DEVE seguir este formato base obrigatório:
"Flat lay moodboard, editorial minimalist style, top-down view, overlapping material and texture samples in layers, clean and sophisticated composition, geometric elements, light neutral background, soft side lighting with realistic shadows, hyper-realistic photography, high resolution, no text, no logos, no hands, no people"

ADICIONE ao prompt base:
1. Os materiais e texturas específicos mencionados no briefing (madeira, mármore, tecidos, metais, etc.)
2. A paleta de cores do projeto (convertida para termos em inglês como warm beige, cool gray, oak wood, travertine, etc.)
3. Elementos característicos do estilo do cliente (ex: terrazzo samples, ribbed panels, natural stone, linen fabric, ceramic tiles)
4. Atmosfera e mood (cozy, luxurious, contemporary, organic, etc.)

EXEMPLO de prompt final:
"Flat lay moodboard, editorial minimalist style, top-down view, overlapping material and texture samples in layers, featuring white oak wood veneer, beige travertine stone, natural linen fabric, terrazzo tiles with gray and pink chips, ribbed ceramic panels, matte ceramic spheres, clean and sophisticated composition, geometric elements, warm neutral color palette, light neutral background, soft side lighting with realistic shadows, hyper-realistic photography, high resolution, no text, no logos, no hands, no people, 4K quality"

Retorne APENAS o prompt completo, sem explicações adicionais.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Memorial de Briefing:\n\n${memorial}` }
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
      const generatedPrompt = data.choices?.[0]?.message?.content || "";

      return new Response(JSON.stringify({ prompt: generatedPrompt }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } else if (type === "reference") {
      // Generate Visual Reference prompt for interior renders
      const systemPrompt = `Você é um especialista em design de interiores e arquitetura, especializado em criar prompts detalhados para geração de imagens de REFERÊNCIA VISUAL de ambientes renderizados.

Com base no memorial de briefing fornecido, crie um prompt em INGLÊS otimizado para ferramentas de IA generativa (Midjourney, DALL-E, Leonardo.ai) que gere uma IMAGEM REALISTA do ambiente descrito.

O prompt DEVE:
1. Descrever o tipo de ambiente (living room, dining room, bedroom, etc.)
2. Incluir o estilo arquitetônico (contemporary, minimalist, modern, classic, etc.)
3. Descrever os elementos principais de mobiliário mencionados
4. Especificar materiais e acabamentos (marble, oak wood, leather, linen, etc.)
5. Definir a paleta de cores com termos específicos
6. Descrever a iluminação (natural light, warm ambient lighting, pendant lights, etc.)
7. Incluir detalhes de atmosfera (cozy, sophisticated, luxurious, inviting, etc.)
8. Adicionar especificações técnicas de renderização

FORMATO do prompt:
"[Tipo de ambiente] interior design, [estilo] style, featuring [elementos principais], [materiais e acabamentos], [paleta de cores] color palette, [iluminação], [atmosfera], architectural visualization, ultra-realistic 3D render, high-end residential interior, professional photography style, 8K resolution, photorealistic, soft natural lighting from large windows, detailed textures, no people, no text"

EXEMPLO de prompt final:
"Contemporary living room interior design, minimalist style, featuring large L-shaped gray linen sofa, caramel leather armchair, white marble coffee table with wooden base, floor-to-ceiling windows, built-in TV wall unit with warm oak wood panels and indirect LED lighting, beige and gray color palette with warm wood accents, pendant lights over dining area, cozy sophisticated atmosphere, architectural visualization, ultra-realistic 3D render, high-end residential interior, professional photography style, 8K resolution, photorealistic, soft natural lighting from large windows, detailed textures, no people, no text"

Retorne APENAS o prompt completo, sem explicações adicionais.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Memorial de Briefing:\n\n${memorial}` }
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
      const generatedPrompt = data.choices?.[0]?.message?.content || "";

      return new Response(JSON.stringify({ prompt: generatedPrompt }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid type" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("briefing-ai error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});