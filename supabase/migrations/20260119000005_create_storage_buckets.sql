-- ============================================================================
-- Migration: Create Storage Buckets and Policies
-- Description: Configure storage buckets for avatars, project images, and files
-- Author: DevOps Senior
-- Date: 2026-01-19
-- ============================================================================

-- ============================================================================
-- CREATE BUCKETS
-- ============================================================================

-- Avatars bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true, -- Public bucket for avatar images
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- Project images bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'project-images',
    'project-images',
    false, -- Private bucket
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

-- Project files bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'project-files',
    'project-files',
    false, -- Private bucket
    52428800, -- 50MB limit
    ARRAY[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/zip',
        'application/x-rar-compressed',
        'text/plain',
        'text/csv'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 52428800;

-- Proposals bucket (private) - for generated PDF proposals
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'proposals',
    'proposals',
    false,
    20971520, -- 20MB limit
    ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 20971520;

-- ============================================================================
-- STORAGE POLICIES - AVATARS (Public bucket)
-- ============================================================================

-- Anyone can view avatars
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Authenticated users can upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- STORAGE POLICIES - PROJECT IMAGES (Private bucket)
-- ============================================================================

-- Users can view project images from their organization
-- Path format: {organization_id}/{project_id}/{filename}
CREATE POLICY "Org members can view project images"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'project-images'
    AND (storage.foldername(name))[1]::uuid = get_user_organization_id()
);

-- Users can upload project images to their organization
CREATE POLICY "Org members can upload project images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'project-images'
    AND (storage.foldername(name))[1]::uuid = get_user_organization_id()
);

-- Users can update project images in their organization
CREATE POLICY "Org members can update project images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'project-images'
    AND (storage.foldername(name))[1]::uuid = get_user_organization_id()
);

-- Users can delete project images in their organization
CREATE POLICY "Org members can delete project images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'project-images'
    AND (storage.foldername(name))[1]::uuid = get_user_organization_id()
);

-- ============================================================================
-- STORAGE POLICIES - PROJECT FILES (Private bucket)
-- ============================================================================

-- Users can view project files from their organization
CREATE POLICY "Org members can view project files"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'project-files'
    AND (storage.foldername(name))[1]::uuid = get_user_organization_id()
);

-- Users can upload project files to their organization
CREATE POLICY "Org members can upload project files"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'project-files'
    AND (storage.foldername(name))[1]::uuid = get_user_organization_id()
);

-- Users can update project files in their organization
CREATE POLICY "Org members can update project files"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'project-files'
    AND (storage.foldername(name))[1]::uuid = get_user_organization_id()
);

-- Coordinators and owners can delete project files
CREATE POLICY "Admins can delete project files"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'project-files'
    AND (storage.foldername(name))[1]::uuid = get_user_organization_id()
    AND EXISTS (
        SELECT 1 FROM profiles
        WHERE user_id = auth.uid()
        AND role IN ('owner', 'coordinator')
    )
);

-- ============================================================================
-- STORAGE POLICIES - PROPOSALS (Private bucket)
-- ============================================================================

-- Users can view proposals from their organization
CREATE POLICY "Org members can view proposals"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'proposals'
    AND (storage.foldername(name))[1]::uuid = get_user_organization_id()
);

-- Users can upload proposals to their organization
CREATE POLICY "Org members can upload proposals"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'proposals'
    AND (storage.foldername(name))[1]::uuid = get_user_organization_id()
);

-- Users can update proposals in their organization
CREATE POLICY "Org members can update proposals"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'proposals'
    AND (storage.foldername(name))[1]::uuid = get_user_organization_id()
);

-- Only owners can delete proposals
CREATE POLICY "Owners can delete proposals"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'proposals'
    AND (storage.foldername(name))[1]::uuid = get_user_organization_id()
    AND EXISTS (
        SELECT 1 FROM profiles
        WHERE user_id = auth.uid()
        AND role = 'owner'
    )
);

-- ============================================================================
-- HELPER FUNCTIONS FOR STORAGE
-- ============================================================================

-- Function to get signed URL for a file (server-side)
CREATE OR REPLACE FUNCTION get_storage_url(
    bucket TEXT,
    file_path TEXT,
    expires_in INTEGER DEFAULT 3600
)
RETURNS TEXT AS $$
DECLARE
    url TEXT;
BEGIN
    -- This is a placeholder - actual implementation depends on your setup
    -- In practice, use Supabase client SDK's createSignedUrl
    RETURN format(
        '/storage/v1/object/sign/%s/%s?token=placeholder',
        bucket,
        file_path
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up orphaned files
CREATE OR REPLACE FUNCTION cleanup_orphaned_storage_files()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER := 0;
BEGIN
    -- Delete project images for deleted projects
    -- Note: This requires storage.objects access which may need service_role
    -- Implementation would depend on your cleanup strategy

    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_orphaned_storage_files() IS
'Cleans up storage files that are no longer referenced. Should be run periodically via cron.';
