-- ============================================================================
-- Seed Data: Default Lookup Data
-- Description: Default environments, categories, suppliers, and workflow templates
-- Author: DevOps Senior
-- Date: 2026-01-19
-- ============================================================================

-- NOTA: Este arquivo deve ser executado APÓS criar uma organização
-- Substitua 'YOUR_ORG_ID' pelo UUID da organização real

-- Para uso em desenvolvimento, crie uma organização de teste primeiro:
-- INSERT INTO organizations (id, name, slug) VALUES ('00000000-0000-0000-0000-000000000001', 'Escritório Teste', 'escritorio-teste');

-- ============================================================================
-- FUNCTION: Seed default lookup data for an organization
-- ============================================================================

CREATE OR REPLACE FUNCTION seed_default_lookup_data(org_id UUID)
RETURNS void AS $$
BEGIN
  -- ============================================================================
  -- ENVIRONMENTS (Ambientes)
  -- ============================================================================

  INSERT INTO lookup_data (organization_id, type, name, data) VALUES
    (org_id, 'environment', 'Sala de Estar', '{"icon": "sofa", "order": 1}'::jsonb),
    (org_id, 'environment', 'Sala de Jantar', '{"icon": "utensils", "order": 2}'::jsonb),
    (org_id, 'environment', 'Cozinha', '{"icon": "cooking-pot", "order": 3}'::jsonb),
    (org_id, 'environment', 'Área Gourmet', '{"icon": "grill", "order": 4}'::jsonb),
    (org_id, 'environment', 'Quarto Casal', '{"icon": "bed-double", "order": 5}'::jsonb),
    (org_id, 'environment', 'Quarto Solteiro', '{"icon": "bed-single", "order": 6}'::jsonb),
    (org_id, 'environment', 'Quarto Infantil', '{"icon": "baby", "order": 7}'::jsonb),
    (org_id, 'environment', 'Suíte Master', '{"icon": "bed-double", "order": 8}'::jsonb),
    (org_id, 'environment', 'Banheiro Social', '{"icon": "bath", "order": 9}'::jsonb),
    (org_id, 'environment', 'Banheiro Suíte', '{"icon": "bath", "order": 10}'::jsonb),
    (org_id, 'environment', 'Lavabo', '{"icon": "sink", "order": 11}'::jsonb),
    (org_id, 'environment', 'Home Office', '{"icon": "desktop", "order": 12}'::jsonb),
    (org_id, 'environment', 'Escritório', '{"icon": "briefcase", "order": 13}'::jsonb),
    (org_id, 'environment', 'Varanda', '{"icon": "sun", "order": 14}'::jsonb),
    (org_id, 'environment', 'Terraço', '{"icon": "cloud-sun", "order": 15}'::jsonb),
    (org_id, 'environment', 'Hall de Entrada', '{"icon": "door-open", "order": 16}'::jsonb),
    (org_id, 'environment', 'Corredor', '{"icon": "arrow-right", "order": 17}'::jsonb),
    (org_id, 'environment', 'Lavanderia', '{"icon": "washing-machine", "order": 18}'::jsonb),
    (org_id, 'environment', 'Área de Serviço', '{"icon": "broom", "order": 19}'::jsonb),
    (org_id, 'environment', 'Garagem', '{"icon": "car", "order": 20}'::jsonb),
    (org_id, 'environment', 'Jardim', '{"icon": "tree", "order": 21}'::jsonb),
    (org_id, 'environment', 'Piscina', '{"icon": "swim", "order": 22}'::jsonb),
    (org_id, 'environment', 'Sala de TV', '{"icon": "tv", "order": 23}'::jsonb),
    (org_id, 'environment', 'Closet', '{"icon": "shirt", "order": 24}'::jsonb),
    (org_id, 'environment', 'Despensa', '{"icon": "archive", "order": 25}'::jsonb)
  ON CONFLICT (organization_id, type, name) DO NOTHING;

  -- ============================================================================
  -- CATEGORIES (Categorias de Produtos)
  -- ============================================================================

  INSERT INTO lookup_data (organization_id, type, name, data) VALUES
    (org_id, 'category', 'Mobiliário', '{"icon": "sofa", "color": "#8B5CF6", "order": 1}'::jsonb),
    (org_id, 'category', 'Marcenaria', '{"icon": "hammer", "color": "#D97706", "order": 2}'::jsonb),
    (org_id, 'category', 'Iluminação', '{"icon": "lightbulb", "color": "#F59E0B", "order": 3}'::jsonb),
    (org_id, 'category', 'Decoração', '{"icon": "flower", "color": "#EC4899", "order": 4}'::jsonb),
    (org_id, 'category', 'Revestimentos', '{"icon": "grid", "color": "#6366F1", "order": 5}'::jsonb),
    (org_id, 'category', 'Metais e Louças', '{"icon": "droplet", "color": "#0EA5E9", "order": 6}'::jsonb),
    (org_id, 'category', 'Eletrodomésticos', '{"icon": "plug", "color": "#10B981", "order": 7}'::jsonb),
    (org_id, 'category', 'Têxtil', '{"icon": "fabric", "color": "#F97316", "order": 8}'::jsonb),
    (org_id, 'category', 'Paisagismo', '{"icon": "tree", "color": "#22C55E", "order": 9}'::jsonb),
    (org_id, 'category', 'Arte', '{"icon": "palette", "color": "#A855F7", "order": 10}'::jsonb)
  ON CONFLICT (organization_id, type, name) DO NOTHING;

  -- ============================================================================
  -- DEFAULT SUPPLIERS (Fornecedores Padrão)
  -- ============================================================================

  INSERT INTO lookup_data (organization_id, type, name, data) VALUES
    (org_id, 'supplier', 'Tok&Stok', '{"website": "https://tokstok.com.br", "category": ["mobiliario", "decoracao"], "notes": ""}'::jsonb),
    (org_id, 'supplier', 'Etna', '{"website": "https://etna.com.br", "category": ["mobiliario", "decoracao"], "notes": ""}'::jsonb),
    (org_id, 'supplier', 'Mobly', '{"website": "https://mobly.com.br", "category": ["mobiliario"], "notes": ""}'::jsonb),
    (org_id, 'supplier', 'MadeiraMadeira', '{"website": "https://madeiramadeira.com.br", "category": ["mobiliario", "revestimentos"], "notes": ""}'::jsonb),
    (org_id, 'supplier', 'Deca', '{"website": "https://deca.com.br", "category": ["metais_loucas"], "notes": ""}'::jsonb),
    (org_id, 'supplier', 'Portobello', '{"website": "https://portobello.com.br", "category": ["revestimentos"], "notes": ""}'::jsonb),
    (org_id, 'supplier', 'Eliane', '{"website": "https://eliane.com", "category": ["revestimentos"], "notes": ""}'::jsonb),
    (org_id, 'supplier', 'Roca', '{"website": "https://roca.com.br", "category": ["metais_loucas"], "notes": ""}'::jsonb),
    (org_id, 'supplier', 'Yamamura', '{"website": "https://yamamura.com.br", "category": ["iluminacao"], "notes": ""}'::jsonb),
    (org_id, 'supplier', 'Lumini', '{"website": "https://lumini.com.br", "category": ["iluminacao"], "notes": ""}'::jsonb),
    (org_id, 'supplier', 'Dpot', '{"website": "https://dpot.com.br", "category": ["mobiliario"], "notes": "Design assinado"}'::jsonb),
    (org_id, 'supplier', 'Cremme', '{"website": "https://cremme.com.br", "category": ["mobiliario"], "notes": "Design contemporâneo"}'::jsonb),
    (org_id, 'supplier', 'Westwing', '{"website": "https://westwing.com.br", "category": ["decoracao", "textil"], "notes": ""}'::jsonb),
    (org_id, 'supplier', 'LZ Studio', '{"website": "https://lzstudio.com.br", "category": ["decoracao", "arte"], "notes": ""}'::jsonb)
  ON CONFLICT (organization_id, type, name) DO NOTHING;

  -- ============================================================================
  -- WORKFLOW TEMPLATES (Templates de Workflow/Kanban)
  -- ============================================================================

  INSERT INTO lookup_data (organization_id, type, name, data) VALUES
    (org_id, 'workflow_template', 'DecorExpress Presencial', '{
      "service_types": ["decorexpress"],
      "modality": "presencial",
      "stages": [
        {"id": "formulario", "name": "Formulário", "color": "#8B5CF6", "order": 1},
        {"id": "visita_tecnica", "name": "Visita Técnica", "color": "#3B82F6", "order": 2},
        {"id": "reuniao_briefing", "name": "Reunião Briefing", "color": "#06B6D4", "order": 3},
        {"id": "conceito", "name": "Conceito", "color": "#10B981", "order": 4},
        {"id": "projeto_3d", "name": "Projeto 3D", "color": "#F59E0B", "order": 5},
        {"id": "revisao", "name": "Revisão", "color": "#EF4444", "order": 6},
        {"id": "lista_compras", "name": "Lista de Compras", "color": "#EC4899", "order": 7},
        {"id": "apresentacao", "name": "Apresentação", "color": "#8B5CF6", "order": 8}
      ]
    }'::jsonb),

    (org_id, 'workflow_template', 'DecorExpress Online', '{
      "service_types": ["decorexpress"],
      "modality": "online",
      "stages": [
        {"id": "formulario", "name": "Formulário", "color": "#8B5CF6", "order": 1},
        {"id": "reuniao_briefing", "name": "Reunião Briefing", "color": "#06B6D4", "order": 2},
        {"id": "conceito", "name": "Conceito", "color": "#10B981", "order": 3},
        {"id": "projeto_3d", "name": "Projeto 3D", "color": "#F59E0B", "order": 4},
        {"id": "revisao", "name": "Revisão", "color": "#EF4444", "order": 5},
        {"id": "lista_compras", "name": "Lista de Compras", "color": "#EC4899", "order": 6},
        {"id": "apresentacao", "name": "Apresentação", "color": "#8B5CF6", "order": 7}
      ]
    }'::jsonb),

    (org_id, 'workflow_template', 'Projeto Completo', '{
      "service_types": ["arquitetonico", "interiores"],
      "modality": "presencial",
      "stages": [
        {"id": "briefing", "name": "Briefing", "color": "#8B5CF6", "order": 1},
        {"id": "levantamento", "name": "Levantamento", "color": "#3B82F6", "order": 2},
        {"id": "estudo_preliminar", "name": "Estudo Preliminar", "color": "#06B6D4", "order": 3},
        {"id": "anteprojeto", "name": "Anteprojeto", "color": "#10B981", "order": 4},
        {"id": "projeto_3d", "name": "Projeto 3D", "color": "#F59E0B", "order": 5},
        {"id": "revisao_cliente", "name": "Revisão Cliente", "color": "#EF4444", "order": 6},
        {"id": "projeto_executivo", "name": "Projeto Executivo", "color": "#EC4899", "order": 7},
        {"id": "detalhamento", "name": "Detalhamento", "color": "#8B5CF6", "order": 8},
        {"id": "entrega", "name": "Entrega", "color": "#22C55E", "order": 9}
      ]
    }'::jsonb),

    (org_id, 'workflow_template', 'Reforma', '{
      "service_types": ["reforma"],
      "modality": "presencial",
      "stages": [
        {"id": "vistoria", "name": "Vistoria", "color": "#8B5CF6", "order": 1},
        {"id": "briefing", "name": "Briefing", "color": "#3B82F6", "order": 2},
        {"id": "projeto", "name": "Projeto", "color": "#06B6D4", "order": 3},
        {"id": "orcamento_obra", "name": "Orçamento Obra", "color": "#10B981", "order": 4},
        {"id": "aprovacao", "name": "Aprovação", "color": "#F59E0B", "order": 5},
        {"id": "acompanhamento", "name": "Acompanhamento", "color": "#EF4444", "order": 6},
        {"id": "entrega", "name": "Entrega", "color": "#22C55E", "order": 7}
      ]
    }'::jsonb),

    (org_id, 'workflow_template', 'Produção de Compras', '{
      "service_types": ["producao"],
      "modality": "presencial",
      "stages": [
        {"id": "lista_aprovada", "name": "Lista Aprovada", "color": "#8B5CF6", "order": 1},
        {"id": "cotacao", "name": "Cotação", "color": "#3B82F6", "order": 2},
        {"id": "aprovacao_orcamento", "name": "Aprovação Orçamento", "color": "#06B6D4", "order": 3},
        {"id": "compras", "name": "Compras", "color": "#10B981", "order": 4},
        {"id": "rastreamento", "name": "Rastreamento", "color": "#F59E0B", "order": 5},
        {"id": "recebimento", "name": "Recebimento", "color": "#EF4444", "order": 6},
        {"id": "instalacao", "name": "Instalação", "color": "#EC4899", "order": 7},
        {"id": "finalizado", "name": "Finalizado", "color": "#22C55E", "order": 8}
      ]
    }'::jsonb)

  ON CONFLICT (organization_id, type, name) DO NOTHING;

  -- ============================================================================
  -- SERVICE TEMPLATES (Templates de Serviço com Fases e Horas)
  -- ============================================================================

  INSERT INTO lookup_data (organization_id, type, name, data) VALUES
    (org_id, 'service_template', 'DecorExpress Padrão', '{
      "service_type": "decorexpress",
      "base_ref": {
        "area": 100,
        "rooms": 5,
        "typology": "apartamento"
      },
      "total_hours": 40,
      "phases": [
        {
          "id": "briefing",
          "name": "Briefing",
          "hours": 4,
          "percent": 10,
          "steps": [
            {"name": "Questionário cliente", "hours": 1},
            {"name": "Reunião inicial", "hours": 2},
            {"name": "Análise de referências", "hours": 1}
          ]
        },
        {
          "id": "conceito",
          "name": "Conceito",
          "hours": 8,
          "percent": 20,
          "steps": [
            {"name": "Moodboard", "hours": 3},
            {"name": "Paleta de cores", "hours": 2},
            {"name": "Seleção de materiais", "hours": 3}
          ]
        },
        {
          "id": "projeto_3d",
          "name": "Projeto 3D",
          "hours": 16,
          "percent": 40,
          "steps": [
            {"name": "Modelagem base", "hours": 4},
            {"name": "Aplicação de materiais", "hours": 4},
            {"name": "Iluminação", "hours": 4},
            {"name": "Renderização", "hours": 4}
          ]
        },
        {
          "id": "lista_compras",
          "name": "Lista de Compras",
          "hours": 8,
          "percent": 20,
          "steps": [
            {"name": "Pesquisa de produtos", "hours": 4},
            {"name": "Cotações", "hours": 2},
            {"name": "Montagem da lista", "hours": 2}
          ]
        },
        {
          "id": "apresentacao",
          "name": "Apresentação",
          "hours": 4,
          "percent": 10,
          "steps": [
            {"name": "Montagem apresentação", "hours": 2},
            {"name": "Reunião de entrega", "hours": 2}
          ]
        }
      ]
    }'::jsonb),

    (org_id, 'service_template', 'Projeto Interiores Completo', '{
      "service_type": "interiores",
      "base_ref": {
        "area": 150,
        "rooms": 8,
        "typology": "apartamento"
      },
      "total_hours": 120,
      "phases": [
        {
          "id": "briefing",
          "name": "Briefing",
          "hours": 8,
          "percent": 7,
          "steps": [
            {"name": "Questionário detalhado", "hours": 2},
            {"name": "Reunião de imersão", "hours": 4},
            {"name": "Documentação", "hours": 2}
          ]
        },
        {
          "id": "levantamento",
          "name": "Levantamento",
          "hours": 12,
          "percent": 10,
          "steps": [
            {"name": "Visita técnica", "hours": 4},
            {"name": "Medição detalhada", "hours": 4},
            {"name": "Registro fotográfico", "hours": 2},
            {"name": "Digitalização", "hours": 2}
          ]
        },
        {
          "id": "estudo_preliminar",
          "name": "Estudo Preliminar",
          "hours": 20,
          "percent": 17,
          "steps": [
            {"name": "Layout funcional", "hours": 8},
            {"name": "Estudos volumétricos", "hours": 6},
            {"name": "Apresentação conceitual", "hours": 6}
          ]
        },
        {
          "id": "projeto_3d",
          "name": "Projeto 3D",
          "hours": 40,
          "percent": 33,
          "steps": [
            {"name": "Modelagem completa", "hours": 16},
            {"name": "Materiais e texturas", "hours": 8},
            {"name": "Iluminação", "hours": 8},
            {"name": "Renderização final", "hours": 8}
          ]
        },
        {
          "id": "detalhamento",
          "name": "Detalhamento",
          "hours": 32,
          "percent": 27,
          "steps": [
            {"name": "Plantas técnicas", "hours": 12},
            {"name": "Detalhes construtivos", "hours": 8},
            {"name": "Especificações", "hours": 8},
            {"name": "Memorial descritivo", "hours": 4}
          ]
        },
        {
          "id": "entrega",
          "name": "Entrega",
          "hours": 8,
          "percent": 6,
          "steps": [
            {"name": "Compilação final", "hours": 4},
            {"name": "Apresentação ao cliente", "hours": 4}
          ]
        }
      ]
    }'::jsonb)

  ON CONFLICT (organization_id, type, name) DO NOTHING;

END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION seed_default_lookup_data(UUID) IS
'Popula lookup_data com dados padrão para uma organização. Chamar após criar nova organização.';

-- ============================================================================
-- AUTO-SEED ON NEW ORGANIZATION
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_seed_organization()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM seed_default_lookup_data(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER seed_new_organization
  AFTER INSERT ON organizations
  FOR EACH ROW EXECUTE FUNCTION auto_seed_organization();

COMMENT ON FUNCTION auto_seed_organization() IS
'Trigger que automaticamente popula lookup_data quando nova organização é criada';
