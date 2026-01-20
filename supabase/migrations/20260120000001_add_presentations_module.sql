-- ============================================================================
-- Migration: Add Presentations Module
-- Description: Tables for presentation system (images, sections, items)
-- Author: DevOps Senior
-- Date: 2026-01-20
-- ============================================================================

-- ============================================================================
-- 1. PRESENTATIONS (Apresentações)
-- ============================================================================
-- Entidade que agrupa todas as informações de uma apresentação de projeto

CREATE TABLE presentations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,

    -- Identificação
    name TEXT NOT NULL,
    code TEXT, -- Ex: APRES-001

    -- Fase da apresentação
    phase TEXT NOT NULL DEFAULT 'apresentacao' CHECK (phase IN (
        'apresentacao', 'revisao', 'manual', 'entrega'
    )),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'in_progress', 'ready', 'delivered'
    )),

    -- Dados do cliente (snapshot)
    client_data JSONB DEFAULT '{
        "name": null,
        "phone": null,
        "email": null,
        "address": null,
        "cpf": null,
        "project_code": null
    }'::jsonb,

    -- Configurações da apresentação
    settings JSONB DEFAULT '{
        "architect_name": null,
        "start_date": null,
        "delivery_date": null,
        "total_area_m2": 0,
        "environments": []
    }'::jsonb,

    -- Metadados
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Comentários
COMMENT ON TABLE presentations IS 'Apresentações de projeto com imagens e itens';
COMMENT ON COLUMN presentations.phase IS 'Fase: apresentacao, revisao, manual, entrega';
COMMENT ON COLUMN presentations.status IS 'Status: draft, in_progress, ready, delivered';
COMMENT ON COLUMN presentations.client_data IS 'Snapshot dos dados do cliente';
COMMENT ON COLUMN presentations.settings IS 'Config: arquiteto, datas, área, ambientes';

-- ============================================================================
-- 2. PRESENTATION_IMAGES (Imagens da Apresentação)
-- ============================================================================
-- Imagens organizadas por seção (fotos antes, moodboard, referencias, etc)

CREATE TABLE presentation_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    presentation_id UUID NOT NULL REFERENCES presentations(id) ON DELETE CASCADE,

    -- Seção da imagem
    section TEXT NOT NULL CHECK (section IN (
        'photos_before',  -- Fotos antes (max 4)
        'moodboard',      -- Moodboard/Paleta (max 1)
        'references',     -- Referências/Inspirações (max 6)
        'floor_plan',     -- Planta baixa (max 1)
        'renders'         -- Renders 3D (max 10, min 1)
    )),

    -- Dados da imagem
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    filename TEXT,
    file_size INTEGER, -- em bytes

    -- Ordenação
    display_order INTEGER NOT NULL DEFAULT 0,

    -- Metadados
    metadata JSONB DEFAULT '{
        "width": null,
        "height": null,
        "format": null,
        "alt_text": null
    }'::jsonb,

    created_at TIMESTAMPTZ DEFAULT now()
);

-- Comentários
COMMENT ON TABLE presentation_images IS 'Imagens da apresentação organizadas por seção';
COMMENT ON COLUMN presentation_images.section IS 'Seção: photos_before, moodboard, references, floor_plan, renders';
COMMENT ON COLUMN presentation_images.display_order IS 'Ordem de exibição dentro da seção';

-- ============================================================================
-- 3. PRESENTATION_ITEMS (Itens da Apresentação)
-- ============================================================================
-- Itens de layout e complementares vinculados à apresentação

CREATE TABLE presentation_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    presentation_id UUID NOT NULL REFERENCES presentations(id) ON DELETE CASCADE,

    -- Identificação
    number INTEGER NOT NULL, -- Número sequencial (1, 2, 3...)
    name TEXT NOT NULL,

    -- Classificação
    ambiente TEXT, -- Sala de Estar, Cozinha, etc.
    category TEXT NOT NULL CHECK (category IN (
        -- Layout (com posição na planta)
        'mobiliario',
        'marcenaria',
        'marmoraria',
        'iluminacao',
        'decoracao',
        'cortinas',
        -- Complementares (sem posição)
        'materiais_revestimentos',
        'eletrica',
        'hidraulica',
        'mao_de_obra',
        'acabamentos',
        'outros'
    )),
    item_type TEXT NOT NULL DEFAULT 'layout' CHECK (item_type IN ('layout', 'complementary')),

    -- Dados do produto
    product JSONB DEFAULT '{
        "description": null,
        "quantity": 1,
        "unit": "un",
        "unit_price": 0,
        "total_price": 0,
        "supplier": null,
        "supplier_url": null,
        "product_link": null,
        "image_url": null
    }'::jsonb,

    -- Posição na planta (apenas para layout items)
    position JSONB DEFAULT '{
        "x": null,
        "y": null,
        "rotation": 0,
        "scale": 1
    }'::jsonb,

    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'complete')),
    -- pending = falta preço ou link
    -- complete = tem preço E link

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Comentários
COMMENT ON TABLE presentation_items IS 'Itens de layout e complementares da apresentação';
COMMENT ON COLUMN presentation_items.number IS 'Número sequencial para identificação visual';
COMMENT ON COLUMN presentation_items.category IS 'Categoria: mobiliario, marcenaria, marmoraria, etc';
COMMENT ON COLUMN presentation_items.item_type IS 'Tipo: layout (com posição) ou complementary (sem posição)';
COMMENT ON COLUMN presentation_items.position IS 'Posição na planta baixa (x, y, rotation, scale)';
COMMENT ON COLUMN presentation_items.status IS 'Status: pending (falta dados) ou complete';
