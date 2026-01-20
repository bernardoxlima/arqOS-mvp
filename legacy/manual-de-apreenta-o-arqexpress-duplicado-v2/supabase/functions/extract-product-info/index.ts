import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Lista de ambientes conhecidos para mapear - com tipos específicos de quartos
const KNOWN_AMBIENTES = [
  'SALA DE ESTAR', 'SALA DE JANTAR', 'SALA DE ESTAR E JANTAR', 'LIVING',
  'COZINHA', 'QUARTO DE CASAL', 'QUARTO DE SOLTEIRO', 'QUARTO DE BEBÊ', 
  'QUARTO INFANTIL', 'HOME OFFICE', 'BANHEIRO', 'LAVABO', 'VARANDA',
  'ÁREA GOURMET', 'CLOSET', 'HALL'
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { url, imageBase64, mode } = body;

    // Modo de análise de planta baixa
    if (mode === 'floor-plan' && imageBase64) {
      return await analyzeFloorPlan(imageBase64);
    }

    // Modo padrão: extração de produto de URL
    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (!firecrawlApiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl não configurado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!lovableApiKey) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'AI não configurado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Scraping URL:', formattedUrl);

    // 1. Scrape the product page
const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['markdown', 'screenshot'],
        onlyMainContent: true,
        waitFor: 2000,
      }),
    });

    const scrapeData = await scrapeResponse.json();

    if (!scrapeResponse.ok) {
      console.error('Firecrawl API error:', scrapeData);
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao acessar a página do produto' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const markdown = scrapeData.data?.markdown || scrapeData.markdown || '';
    const metadata = scrapeData.data?.metadata || scrapeData.metadata || {};
    const screenshot = scrapeData.data?.screenshot || scrapeData.screenshot || null;
    
    // Try to get product image from metadata or Open Graph
    let productImage = metadata.ogImage || metadata.image || null;
    
    // If we have a screenshot, use it as fallback
    if (!productImage && screenshot) {
      productImage = screenshot;
    }
    
    if (!markdown) {
      return new Response(
        JSON.stringify({ success: false, error: 'Não foi possível extrair conteúdo da página' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Scraped content length:', markdown.length);
    console.log('Product image found:', !!productImage);

    // 2. Use AI to extract structured product info
    const systemPrompt = `Você é um assistente especializado em extrair informações de produtos de lojas online brasileiras.
Analise o conteúdo da página e extraia as informações do produto de forma estruturada.

IMPORTANTE:
- O nome do produto deve ser CURTO e DESCRITIVO (ex: "SOFÁ 3 LUGARES TUFTY DOURO", "MESA DE JANTAR REDONDA 120CM")
- Use MAIÚSCULAS para o nome do produto
- Extraia o preço APENAS se claramente visível (valor numérico, sem R$)
- Identifique o fornecedor/loja pelo domínio ou nome na página
- Tente identificar a categoria do produto
- Se encontrar a URL da imagem principal do produto, extraia também`;

    const userPrompt = `Extraia as informações deste produto:

URL: ${formattedUrl}
Título da página: ${metadata.title || 'N/A'}
${metadata.ogImage ? `Imagem OG: ${metadata.ogImage}` : ''}

Conteúdo da página:
${markdown.slice(0, 8000)}

Retorne APENAS um JSON com esta estrutura (sem markdown, sem código):
{
  "nome": "NOME DO PRODUTO EM MAIÚSCULAS",
  "preco": 0,
  "fornecedor": "Nome da Loja",
  "categoria": "mobiliario|marcenaria|iluminacao|decoracao|materiais|outros",
  "imagemUrl": "https://... ou null se não encontrar"
}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      
      // Return basic info from metadata if AI fails
      const domain = new URL(formattedUrl).hostname.replace('www.', '').split('.')[0];
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: {
            nome: metadata.title?.toUpperCase().slice(0, 50) || 'PRODUTO',
            preco: 0,
            fornecedor: domain.charAt(0).toUpperCase() + domain.slice(1),
            categoria: 'outros',
            link: formattedUrl,
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || '';
    
    console.log('AI response:', aiContent);

    // Parse AI response
    let productInfo;
    try {
      // Clean up the response - remove markdown code blocks if present
      let cleanContent = aiContent.trim();
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/```json?\n?/g, '').replace(/```$/g, '');
      }
      productInfo = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback to basic extraction
      const domain = new URL(formattedUrl).hostname.replace('www.', '').split('.')[0];
      productInfo = {
        nome: metadata.title?.toUpperCase().slice(0, 50) || 'PRODUTO',
        preco: 0,
        fornecedor: domain.charAt(0).toUpperCase() + domain.slice(1),
        categoria: 'outros',
      };
    }

    // Determine the best image URL
    const imageUrl = productInfo.imagemUrl || productImage || null;

    // Ensure valid response structure
    const result = {
      nome: productInfo.nome || 'PRODUTO',
      preco: typeof productInfo.preco === 'number' ? productInfo.preco : 0,
      fornecedor: productInfo.fornecedor || '',
      categoria: productInfo.categoria || 'outros',
      link: formattedUrl,
      imagem: imageUrl,
    };

    console.log('Extracted product info:', result);

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error extracting product info:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Função para analisar planta baixa
async function analyzeFloorPlan(imageBase64: string): Promise<Response> {
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
  
  if (!lovableApiKey) {
    console.error('LOVABLE_API_KEY not configured');
    return new Response(
      JSON.stringify({ error: 'AI não configurado' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const prompt = `Analise esta planta baixa ou imagem de ambiente de arquitetura/design de interiores.

TAREFA 1 - IDENTIFICAR AMBIENTES:
Identifique os cômodos presentes. Use APENAS estas nomenclaturas:
- SALA DE ESTAR, SALA DE JANTAR, SALA DE ESTAR E JANTAR
- QUARTO DE CASAL (cama grande/king/queen)
- QUARTO DE SOLTEIRO (cama pequena/solteiro)
- QUARTO DE BEBÊ (berço visível)
- QUARTO INFANTIL (decoração infantil, sem berço)
- COZINHA, BANHEIRO, LAVABO, HOME OFFICE, VARANDA, CLOSET

COMO DIFERENCIAR QUARTOS:
- Se vê cama de casal/king/queen → QUARTO DE CASAL
- Se vê cama de solteiro/pequena → QUARTO DE SOLTEIRO  
- Se vê berço → QUARTO DE BEBÊ
- Se decoração infantil sem berço → QUARTO INFANTIL
- Se impossível determinar, use QUARTO DE CASAL como padrão

TAREFA 2 - ITENS EXTRAS:
Liste móveis/itens específicos visíveis ou em legendas.

RESPONDA APENAS com JSON válido (sem markdown):
{
  "ambientes": ["QUARTO DE SOLTEIRO"],
  "extras": ["Cama solteiro", "Escrivaninha"]
}`;

  console.log('Analyzing floor plan with AI...');

  try {
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: { url: imageBase64 }
              }
            ]
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns minutos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Erro ao processar imagem com IA' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || '';
    
    console.log('AI floor plan analysis response:', aiContent);

    // Parse AI response
    let analysisResult;
    try {
      let cleanContent = aiContent.trim();
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/```json?\n?/g, '').replace(/```$/g, '');
      }
      analysisResult = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI floor plan response:', parseError);
      return new Response(
        JSON.stringify({ 
          ambientes: [], 
          extras: [],
          error: 'Não foi possível interpretar a resposta da IA' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        ambientes: analysisResult.ambientes || [],
        extras: analysisResult.extras || [],
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error analyzing floor plan:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
