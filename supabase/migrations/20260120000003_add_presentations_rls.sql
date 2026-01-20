-- ============================================================================
-- Migration: RLS Policies for Presentations Module
-- Description: Row Level Security policies for multi-tenant isolation
-- Author: DevOps Senior
-- Date: 2026-01-20
-- ============================================================================

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE presentation_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE presentation_items ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PRESENTATIONS POLICIES
-- ============================================================================

-- Users can view presentations from their organization
CREATE POLICY "Users can view presentations from their organization"
ON presentations FOR SELECT
USING (organization_id = get_user_organization_id());

-- Users can create presentations in their organization
CREATE POLICY "Users can create presentations in their organization"
ON presentations FOR INSERT
WITH CHECK (organization_id = get_user_organization_id());

-- Users can update presentations in their organization
CREATE POLICY "Users can update presentations in their organization"
ON presentations FOR UPDATE
USING (organization_id = get_user_organization_id());

-- Coordinators and owners can delete presentations
CREATE POLICY "Coordinators can delete presentations"
ON presentations FOR DELETE
USING (
    organization_id = get_user_organization_id()
    AND EXISTS (
        SELECT 1 FROM profiles
        WHERE user_id = auth.uid()
        AND role IN ('owner', 'coordinator', 'admin')
    )
);

-- ============================================================================
-- PRESENTATION_IMAGES POLICIES
-- ============================================================================

-- Users can view images from their organization
CREATE POLICY "Users can view images from their organization"
ON presentation_images FOR SELECT
USING (organization_id = get_user_organization_id());

-- Users can upload images to their organization
CREATE POLICY "Users can upload images to their organization"
ON presentation_images FOR INSERT
WITH CHECK (organization_id = get_user_organization_id());

-- Users can update images in their organization
CREATE POLICY "Users can update images in their organization"
ON presentation_images FOR UPDATE
USING (organization_id = get_user_organization_id());

-- Users can delete images in their organization
CREATE POLICY "Users can delete images in their organization"
ON presentation_images FOR DELETE
USING (organization_id = get_user_organization_id());

-- ============================================================================
-- PRESENTATION_ITEMS POLICIES
-- ============================================================================

-- Users can view items from their organization
CREATE POLICY "Users can view items from their organization"
ON presentation_items FOR SELECT
USING (organization_id = get_user_organization_id());

-- Users can create items in their organization
CREATE POLICY "Users can create items in their organization"
ON presentation_items FOR INSERT
WITH CHECK (organization_id = get_user_organization_id());

-- Users can update items in their organization
CREATE POLICY "Users can update items in their organization"
ON presentation_items FOR UPDATE
USING (organization_id = get_user_organization_id());

-- Users can delete items in their organization
CREATE POLICY "Users can delete items in their organization"
ON presentation_items FOR DELETE
USING (organization_id = get_user_organization_id());
