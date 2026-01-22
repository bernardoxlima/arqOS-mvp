-- ============================================================================
-- Migration: Create Invitations Table
-- Description: Table for team member invitations via magic link
-- Author: DevOps Senior
-- Date: 2026-01-22
-- ============================================================================

-- ============================================================================
-- ADD SOCIO ROLE TO PROFILES
-- ============================================================================

-- First, drop the existing constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add new constraint with 'socio' role
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('owner', 'socio', 'coordinator', 'architect', 'intern', 'admin'));

-- ============================================================================
-- CREATE INVITATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('socio', 'coordinator', 'architect', 'intern', 'admin')),
  invited_by UUID NOT NULL REFERENCES profiles(id),
  token UUID NOT NULL DEFAULT gen_random_uuid(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, email)
);

COMMENT ON TABLE invitations IS 'Team member invitations pending acceptance';
COMMENT ON COLUMN invitations.token IS 'Unique token for invitation acceptance';
COMMENT ON COLUMN invitations.expires_at IS 'Invitation expiry date (7 days default)';
COMMENT ON COLUMN invitations.accepted_at IS 'When the invitation was accepted (null if pending)';

-- ============================================================================
-- INDEX FOR TOKEN LOOKUPS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_org ON invitations(organization_id);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Members can view their organization's invitations
CREATE POLICY "Members can view org invitations"
  ON invitations FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM profiles WHERE user_id = auth.uid()
  ));

-- Authorized members can create invitations (validation done in API)
-- Owner, socio, coordinator can create invitations
CREATE POLICY "Authorized members can create invitations"
  ON invitations FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM profiles
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'socio', 'coordinator')
    )
  );

-- Authorized members can delete invitations
CREATE POLICY "Authorized members can delete invitations"
  ON invitations FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles
      WHERE user_id = auth.uid()
      AND role IN ('owner', 'socio', 'coordinator')
    )
  );

-- Allow updates to mark invitation as accepted (via service role or trigger)
CREATE POLICY "Service can update invitations"
  ON invitations FOR UPDATE
  USING (true)
  WITH CHECK (true);
