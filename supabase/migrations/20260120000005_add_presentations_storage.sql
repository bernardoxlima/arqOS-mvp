-- ============================================================================
-- Migration: Storage Bucket for Presentation Images
-- Description: Dedicated storage bucket and policies for presentation images
-- Author: DevOps Senior
-- Date: 2026-01-20
-- ============================================================================

-- ============================================================================
-- CREATE BUCKET
-- ============================================================================

-- Create dedicated bucket for presentations
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'presentation-images',
    'presentation-images',
    false, -- Private bucket
    10485760, -- 10MB per image
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================
-- Path format: {organization_id}/{presentation_id}/{section}/{filename}

-- View images from own organization
CREATE POLICY "Org members can view presentation images"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'presentation-images'
    AND (storage.foldername(name))[1]::uuid = get_user_organization_id()
);

-- Upload images to own organization
CREATE POLICY "Org members can upload presentation images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'presentation-images'
    AND (storage.foldername(name))[1]::uuid = get_user_organization_id()
);

-- Update images in own organization
CREATE POLICY "Org members can update presentation images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'presentation-images'
    AND (storage.foldername(name))[1]::uuid = get_user_organization_id()
);

-- Delete images in own organization
CREATE POLICY "Org members can delete presentation images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'presentation-images'
    AND (storage.foldername(name))[1]::uuid = get_user_organization_id()
);
