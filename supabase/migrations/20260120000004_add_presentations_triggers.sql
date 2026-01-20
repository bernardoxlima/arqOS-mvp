-- ============================================================================
-- Migration: Triggers and Functions for Presentations Module
-- Description: Automated behaviors and helper functions for presentations
-- Author: DevOps Senior
-- Date: 2026-01-20
-- ============================================================================

-- ============================================================================
-- APPLY EXISTING UPDATE_UPDATED_AT TRIGGER
-- ============================================================================

-- Reuse existing update_updated_at function from initial migration
CREATE TRIGGER update_presentations_updated_at
    BEFORE UPDATE ON presentations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_presentation_items_updated_at
    BEFORE UPDATE ON presentation_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- FUNCTION: Auto-number presentation items
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_number_presentation_item()
RETURNS TRIGGER AS $$
DECLARE
    next_number INTEGER;
BEGIN
    -- Get next number for this presentation
    SELECT COALESCE(MAX(number), 0) + 1
    INTO next_number
    FROM presentation_items
    WHERE presentation_id = NEW.presentation_id;

    NEW.number = next_number;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION auto_number_presentation_item() IS
'Atribui automaticamente um número sequencial aos itens da apresentação';

CREATE TRIGGER trigger_auto_number_item
    BEFORE INSERT ON presentation_items
    FOR EACH ROW
    WHEN (NEW.number IS NULL OR NEW.number = 0)
    EXECUTE FUNCTION auto_number_presentation_item();

-- ============================================================================
-- FUNCTION: Auto-calculate item status
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_calculate_item_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Item is complete if has price > 0 AND has product_link
    IF (NEW.product->>'unit_price')::numeric > 0
       AND NEW.product->>'product_link' IS NOT NULL
       AND NEW.product->>'product_link' != '' THEN
        NEW.status = 'complete';
    ELSE
        NEW.status = 'pending';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION auto_calculate_item_status() IS
'Calcula automaticamente o status do item baseado em preço e link do produto';

CREATE TRIGGER trigger_auto_item_status
    BEFORE INSERT OR UPDATE ON presentation_items
    FOR EACH ROW
    EXECUTE FUNCTION auto_calculate_item_status();

-- ============================================================================
-- FUNCTION: Validate image section limits
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_image_section_limit()
RETURNS TRIGGER AS $$
DECLARE
    current_count INTEGER;
    max_allowed INTEGER;
BEGIN
    -- Define limits per section
    max_allowed := CASE NEW.section
        WHEN 'photos_before' THEN 4
        WHEN 'moodboard' THEN 1
        WHEN 'references' THEN 6
        WHEN 'floor_plan' THEN 1
        WHEN 'renders' THEN 10
        ELSE 10
    END;

    -- Count existing images in this section
    SELECT COUNT(*)
    INTO current_count
    FROM presentation_images
    WHERE presentation_id = NEW.presentation_id
    AND section = NEW.section
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

    IF current_count >= max_allowed THEN
        RAISE EXCEPTION 'Section "%" already has maximum allowed images (%)',
            NEW.section, max_allowed;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_image_section_limit() IS
'Valida o limite de imagens por seção: photos_before(4), moodboard(1), references(6), floor_plan(1), renders(10)';

CREATE TRIGGER trigger_validate_image_limit
    BEFORE INSERT OR UPDATE ON presentation_images
    FOR EACH ROW
    EXECUTE FUNCTION validate_image_section_limit();

-- ============================================================================
-- FUNCTION: Renumber items after delete
-- ============================================================================

CREATE OR REPLACE FUNCTION renumber_presentation_items()
RETURNS TRIGGER AS $$
BEGIN
    -- Renumber all items for this presentation
    WITH numbered AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY number) as new_number
        FROM presentation_items
        WHERE presentation_id = OLD.presentation_id
    )
    UPDATE presentation_items pi
    SET number = n.new_number
    FROM numbered n
    WHERE pi.id = n.id;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION renumber_presentation_items() IS
'Renumera automaticamente os itens após exclusão para manter sequência contínua';

CREATE TRIGGER trigger_renumber_after_delete
    AFTER DELETE ON presentation_items
    FOR EACH ROW
    EXECUTE FUNCTION renumber_presentation_items();

-- ============================================================================
-- FUNCTION: Generate presentation code
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_presentation_code(org_id UUID)
RETURNS TEXT AS $$
DECLARE
    next_num INTEGER;
    year_str TEXT;
BEGIN
    year_str := TO_CHAR(NOW(), 'YY');

    SELECT COALESCE(MAX(
        CAST(SUBSTRING(code FROM 'APRES-\d{2}(\d{3})') AS INTEGER)
    ), 0) + 1
    INTO next_num
    FROM presentations
    WHERE organization_id = org_id
      AND code LIKE 'APRES-' || year_str || '%';

    RETURN 'APRES-' || year_str || LPAD(next_num::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_presentation_code(UUID) IS
'Gera código sequencial para apresentações no formato APRES-YYNNN';

-- ============================================================================
-- FUNCTION: Auto-generate presentation code
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_generate_presentation_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.code IS NULL OR NEW.code = '' THEN
        NEW.code := generate_presentation_code(NEW.organization_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION auto_generate_presentation_code() IS
'Gera automaticamente código de apresentação se não fornecido';

CREATE TRIGGER auto_presentation_code
    BEFORE INSERT ON presentations
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_presentation_code();

-- ============================================================================
-- FUNCTION: Log presentation activity
-- ============================================================================

CREATE TRIGGER log_presentation_activity
    AFTER INSERT OR UPDATE OR DELETE ON presentations
    FOR EACH ROW
    EXECUTE FUNCTION log_activity();

-- ============================================================================
-- FUNCTION: Calculate presentation progress
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_presentation_progress(pres_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    total_items INTEGER;
    complete_items INTEGER;
    images_by_section JSONB;
BEGIN
    -- Count items
    SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'complete')
    INTO total_items, complete_items
    FROM presentation_items
    WHERE presentation_id = pres_id;

    -- Count images by section
    SELECT jsonb_object_agg(section, cnt)
    INTO images_by_section
    FROM (
        SELECT section, COUNT(*) as cnt
        FROM presentation_images
        WHERE presentation_id = pres_id
        GROUP BY section
    ) t;

    result := jsonb_build_object(
        'total_items', total_items,
        'complete_items', complete_items,
        'progress_percent', CASE
            WHEN total_items > 0 THEN ROUND((complete_items::numeric / total_items) * 100)
            ELSE 0
        END,
        'images_by_section', COALESCE(images_by_section, '{}'::jsonb),
        'has_floor_plan', EXISTS (
            SELECT 1 FROM presentation_images
            WHERE presentation_id = pres_id AND section = 'floor_plan'
        ),
        'has_renders', EXISTS (
            SELECT 1 FROM presentation_images
            WHERE presentation_id = pres_id AND section = 'renders'
        )
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION calculate_presentation_progress(UUID) IS
'Calcula o progresso de uma apresentação: itens completos, imagens por seção, etc';

-- ============================================================================
-- FUNCTION: Get presentation summary
-- ============================================================================

CREATE OR REPLACE FUNCTION get_presentation_summary(pres_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    pres presentations;
    items_total NUMERIC;
BEGIN
    -- Get presentation
    SELECT * INTO pres FROM presentations WHERE id = pres_id;

    IF pres IS NULL THEN
        RETURN NULL;
    END IF;

    -- Calculate items total value
    SELECT COALESCE(SUM((product->>'total_price')::numeric), 0)
    INTO items_total
    FROM presentation_items
    WHERE presentation_id = pres_id;

    result := jsonb_build_object(
        'id', pres.id,
        'name', pres.name,
        'code', pres.code,
        'phase', pres.phase,
        'status', pres.status,
        'client_name', pres.client_data->>'name',
        'architect_name', pres.settings->>'architect_name',
        'total_area_m2', pres.settings->>'total_area_m2',
        'items_total_value', items_total,
        'progress', calculate_presentation_progress(pres_id),
        'created_at', pres.created_at,
        'updated_at', pres.updated_at
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_presentation_summary(UUID) IS
'Retorna um resumo da apresentação com progresso e valores calculados';
