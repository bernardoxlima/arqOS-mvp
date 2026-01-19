import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cores das categorias (hex para prompts de IA)
const CATEGORY_COLORS: Record<string, { color: string; label: string }> = {
  mobiliario: { color: '#1E3A5F', label: 'Azul marinho' },
  marcenaria: { color: '#F59E0B', label: 'Amarelo' },
  marmoraria: { color: '#8B4513', label: 'Marrom' },
  decoracao: { color: '#8B5CF6', label: 'Roxo/Violeta' },
  iluminacao: { color: '#F97316', label: 'Laranja' },
};

interface AnnotationItem {
  number: number;
  name: string;
  category: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, items } = await req.json();
    
    if (!imageBase64 || !items || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "É necessário enviar a imagem e a lista de itens" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the numbered items list with category colors for the prompt
    const itemsList = (items as AnnotationItem[]).map((item) => {
      const catInfo = CATEGORY_COLORS[item.category] || { color: '#1E3A5F', label: 'Azul' };
      return `${item.number}. ${item.name} → Círculo na cor ${catInfo.label} (${catInfo.color})`;
    }).join("\n");

    // Summarize colors being used
    const usedCategories = [...new Set((items as AnnotationItem[]).map(i => i.category))];
    const colorLegend = usedCategories.map(cat => {
      const info = CATEGORY_COLORS[cat] || { color: '#1E3A5F', label: 'Azul' };
      return `- ${info.label}: ${info.color}`;
    }).join("\n");

    const prompt = `Esta é uma planta baixa de arquitetura/design de interiores. Você precisa adicionar marcadores numerados circulares na imagem para identificar cada item da lista abaixo.

LISTA DE ITENS A MARCAR (com cores específicas):
${itemsList}

LEGENDA DE CORES:
${colorLegend}

INSTRUÇÕES IMPORTANTES:
- Adicione círculos COLORIDOS (conforme a cor indicada para cada item) com números brancos dentro
- Cada item tem sua cor específica baseada na categoria (veja a lista acima)
- Os círculos devem ser pequenos mas legíveis (aproximadamente 3-4% do tamanho da imagem)
- Posicione os números de forma lógica na planta, onde cada item provavelmente estaria
- Mantenha a imagem original intacta, apenas adicione os marcadores numerados coloridos
- Use círculos sólidos na cor indicada com números brancos para melhor contraste
- Itens de Marcenaria (Amarelo) geralmente ficam nas paredes/laterais
- Itens de Mobiliário (Azul marinho) ficam no centro dos ambientes
- Itens de Iluminação (Laranja) ficam no teto ou próximo às paredes
- Itens de Decoração (Roxo) ficam espalhados pelos ambientes
- Itens de Marmoraria (Marrom) ficam em bancadas e áreas molhadas`;

    console.log("Calling AI Gateway to annotate floor plan with", items.length, "items and colors");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: { url: imageBase64 }
              }
            ]
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Por favor, adicione créditos à sua conta." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Erro ao processar imagem com IA" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log("AI Gateway response received");

    // Extract the annotated image from the response
    const annotatedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!annotatedImageUrl) {
      console.error("No image in AI response:", JSON.stringify(data, null, 2));
      return new Response(
        JSON.stringify({ error: "A IA não retornou uma imagem anotada" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return the annotated image
    return new Response(
      JSON.stringify({ 
        annotatedImage: annotatedImageUrl,
        items: items
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in annotate-floor-plan function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
