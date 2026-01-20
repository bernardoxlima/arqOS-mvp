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
    const { description, ambiente } = await req.json();

    if (!description) {
      return new Response(
        JSON.stringify({ error: "Descrição é obrigatória" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    console.log("Parsing project description with AI...");
    console.log("Description:", description);
    console.log("Ambiente:", ambiente);

    const systemPrompt = `Você é um assistente especializado em projetos de arquitetura e design de interiores.
Sua tarefa é extrair TODOS os itens individuais de uma descrição de projeto e categorizá-los corretamente.

CATEGORIAS DISPONÍVEIS:

LAYOUT DE PROJETO (itens para comprar/especificar):
- MOBILIARIO: Sofás, camas, berços, cômodas, mesas, cadeiras, poltronas, racks, estantes
- DECORACAO: Quadros, espelhos, vasos, objetos decorativos, almofadas
- ILUMINACAO: Luminárias, pendentes, spots, arandelas, abajures
- CORTINAS: Cortinas, persianas, blackout, varões

MARCENARIA (móveis sob medida):
- MARCENARIA: Armários planejados, closets, painéis, nichos, bancadas, estantes sob medida

MATERIAIS (para comprar):
- MATERIAIS: Tintas, papéis de parede, revestimentos, pisos, tecidos

SERVIÇOS/MÃO DE OBRA:
- MAO_DE_OBRA: Pintura de parede, instalação de cortina, montagem de móveis, instalação de quadros, assentamento de piso

REGRAS:
1. Extraia CADA item individualmente (não agrupe)
2. Identifique quantidade quando mencionada (ex: "alguns quadros" = 3, "2 mesas" = 2)
3. Para serviços de instalação, sempre crie o item de mão de obra separado
4. Se mencionar "pintar parede", crie: TINTA (material) + PINTURA (mão de obra)
5. Se mencionar "instalar cortina", crie: CORTINA (produto) + INSTALAÇÃO DE CORTINA (mão de obra)
6. Se mencionar "prender quadros", crie: QUADROS (decoração) + INSTALAÇÃO DE QUADROS (mão de obra)
7. Sempre retorne em formato JSON válido`;

    const userPrompt = `Analise esta descrição de projeto${ambiente ? ` para o ambiente "${ambiente}"` : ''} e extraia TODOS os itens:

"${description}"

Retorne um JSON com o seguinte formato:
{
  "itens": [
    {
      "nome": "Nome do item",
      "categoria": "MOBILIARIO|DECORACAO|ILUMINACAO|CORTINAS|MARCENARIA|MATERIAIS|MAO_DE_OBRA",
      "quantidade": 1,
      "tipo": "LAYOUT|COMPLEMENTAR",
      "observacao": "opcional - detalhes extras"
    }
  ]
}

IMPORTANTE:
- tipo "LAYOUT" para: MOBILIARIO, DECORACAO, ILUMINACAO, CORTINAS, MARCENARIA
- tipo "COMPLEMENTAR" para: MATERIAIS, MAO_DE_OBRA
- Separe produtos de serviços (ex: cortina é produto, instalação é serviço)`;

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
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content || "";
    
    console.log("AI response:", aiContent);

    // Parse JSON from response
    let parsed;
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = aiContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : aiContent.trim();
      parsed = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      // Try to find JSON object in the response
      const jsonObjectMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonObjectMatch) {
        try {
          parsed = JSON.parse(jsonObjectMatch[0]);
        } catch {
          throw new Error("Não foi possível processar a resposta da IA");
        }
      } else {
        throw new Error("Resposta da IA não contém JSON válido");
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        itens: parsed.itens || [],
        ambiente: ambiente || "Geral"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error parsing project description:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Erro ao processar descrição",
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
