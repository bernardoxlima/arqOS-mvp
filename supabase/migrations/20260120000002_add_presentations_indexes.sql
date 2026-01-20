-- ============================================================================
-- Migration: Add Indexes for Presentations Module
-- Description: Performance indexes for presentations, images, and items tables
-- Author: DevOps Senior
-- Date: 2026-01-20
-- ============================================================================

-- ============================================================================
-- PRESENTATIONS INDEXES
-- ============================================================================

-- Organization lookup (multi-tenant isolation)
CREATE INDEX idx_presentations_organization ON presentations(organization_id);

-- Project relationship
CREATE INDEX idx_presentations_project ON presentations(project_id);

-- Status filtering
CREATE INDEX idx_presentations_status ON presentations(status);

-- Phase filtering
CREATE INDEX idx_presentations_phase ON presentations(phase);

-- Recent presentations first
CREATE INDEX idx_presentations_created_at ON presentations(created_at DESC);

-- Composite: org + status for common queries
CREATE INDEX idx_presentations_org_status ON presentations(organization_id, status);

-- ============================================================================
-- PRESENTATION_IMAGES INDEXES
-- ============================================================================

-- Presentation lookup
CREATE INDEX idx_presentation_images_presentation ON presentation_images(presentation_id);

-- Section filtering within presentation
CREATE INDEX idx_presentation_images_section ON presentation_images(presentation_id, section);

-- Ordering within section
CREATE INDEX idx_presentation_images_order ON presentation_images(presentation_id, section, display_order);

-- Organization isolation
CREATE INDEX idx_presentation_images_organization ON presentation_images(organization_id);

-- ============================================================================
-- PRESENTATION_ITEMS INDEXES
-- ============================================================================

-- Presentation lookup
CREATE INDEX idx_presentation_items_presentation ON presentation_items(presentation_id);

-- Category filtering
CREATE INDEX idx_presentation_items_category ON presentation_items(presentation_id, category);

-- Ambiente (room) filtering
CREATE INDEX idx_presentation_items_ambiente ON presentation_items(presentation_id, ambiente);

-- Type filtering (layout vs complementary)
CREATE INDEX idx_presentation_items_type ON presentation_items(presentation_id, item_type);

-- Status filtering (pending items)
CREATE INDEX idx_presentation_items_status ON presentation_items(status);

-- Organization isolation
CREATE INDEX idx_presentation_items_organization ON presentation_items(organization_id);

-- Number ordering within presentation
CREATE INDEX idx_presentation_items_number ON presentation_items(presentation_id, number);

-- ============================================================================
-- GIN INDEXES FOR JSONB SEARCH
-- ============================================================================

-- Search in client_data
CREATE INDEX idx_presentations_client_data ON presentations USING GIN (client_data);

-- Search in settings
CREATE INDEX idx_presentations_settings ON presentations USING GIN (settings);

-- Search in product data
CREATE INDEX idx_presentation_items_product ON presentation_items USING GIN (product);

-- Search in image metadata
CREATE INDEX idx_presentation_images_metadata ON presentation_images USING GIN (metadata);
