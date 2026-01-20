-- ============================================================================
-- Migration: Configure Realtime Subscriptions
-- Description: Enable realtime for tables that need live updates
-- Author: DevOps Senior
-- Date: 2026-01-19
-- ============================================================================

-- ============================================================================
-- ENABLE REALTIME ON SELECTED TABLES
-- ============================================================================

-- Projects - for Kanban board updates, status changes
ALTER PUBLICATION supabase_realtime ADD TABLE projects;

-- Time entries - for real-time hours dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE time_entries;

-- Activity log - for live activity feed
ALTER PUBLICATION supabase_realtime ADD TABLE activity_log;

-- Budgets - for proposal status updates
ALTER PUBLICATION supabase_realtime ADD TABLE budgets;

-- Finance records - for financial dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE finance_records;

-- ============================================================================
-- REALTIME CONFIGURATION NOTES
-- ============================================================================

/*
IMPORTANT: Realtime subscriptions respect RLS policies.
Users will only receive updates for rows they have access to.

USAGE IN CLIENT:

// Subscribe to project updates for the organization
const projectSubscription = supabase
  .channel('projects')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'projects',
      filter: `organization_id=eq.${orgId}`
    },
    (payload) => {
      console.log('Project changed:', payload);
      // Update local state
    }
  )
  .subscribe();

// Subscribe to activity log
const activitySubscription = supabase
  .channel('activity')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'activity_log',
      filter: `organization_id=eq.${orgId}`
    },
    (payload) => {
      // Show notification or update feed
    }
  )
  .subscribe();

// Cleanup on unmount
projectSubscription.unsubscribe();
activitySubscription.unsubscribe();

BEST PRACTICES:

1. Always filter by organization_id to reduce message volume
2. Unsubscribe when component unmounts
3. Use separate channels for different tables
4. Handle reconnection gracefully
5. Consider debouncing rapid updates on the client

FILTERING EXAMPLES:

// Only status changes
filter: `organization_id=eq.${orgId}&status=neq.draft`

// Specific project
filter: `id=eq.${projectId}`

// Multiple conditions (use server-side filtering or client-side)
// Note: Supabase realtime filter syntax is limited
// For complex filtering, filter on client after receiving

*/

-- ============================================================================
-- BROADCAST CHANNELS FOR CUSTOM EVENTS
-- ============================================================================

/*
For custom events not tied to database changes, use Broadcast channels:

// Send custom event
await supabase.channel('room1').send({
  type: 'broadcast',
  event: 'cursor-pos',
  payload: { x: 100, y: 200 }
});

// Receive custom events
supabase.channel('room1')
  .on('broadcast', { event: 'cursor-pos' }, ({ payload }) => {
    console.log('Cursor position:', payload);
  })
  .subscribe();

USE CASES FOR BROADCAST:
- Real-time cursor positions (collaborative editing)
- Typing indicators
- User presence
- Custom notifications between users

*/

-- ============================================================================
-- PRESENCE FOR ONLINE USERS
-- ============================================================================

/*
Track online users per organization:

const presenceChannel = supabase.channel(`presence:${orgId}`, {
  config: {
    presence: {
      key: userId,
    },
  },
});

presenceChannel
  .on('presence', { event: 'sync' }, () => {
    const state = presenceChannel.presenceState();
    console.log('Online users:', Object.keys(state));
  })
  .on('presence', { event: 'join' }, ({ key, newPresences }) => {
    console.log('User joined:', key);
  })
  .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
    console.log('User left:', key);
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await presenceChannel.track({
        user_id: userId,
        name: userName,
        online_at: new Date().toISOString(),
      });
    }
  });

*/

-- ============================================================================
-- DISABLE REALTIME (IF NEEDED)
-- ============================================================================

-- To disable realtime for a table:
-- ALTER PUBLICATION supabase_realtime DROP TABLE table_name;

-- Note: Be careful when disabling as it will affect all subscriptions
