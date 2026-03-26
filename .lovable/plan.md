

# Phase 1: Auth, Scoped Database & Deletion Management

## What Already Exists
- Auth page at `/auth` with sign in/sign up forms
- Auth state check in `Index.tsx` that redirects to `/auth` if no session
- `customers` table used for clients (code types as `Client`)
- `projects` table with `customer_id` FK to customers
- `generations` table with `project_id`
- `saved_models` table (id, user_id, name, image_url — no scope columns)
- Client deletion in `ClientProjectSelector` with confirmation dialog
- No project deletion UI
- No sign out button anywhere

---

## 1. Sign Out Button

Add a sign out button to the `InputColumn` header area (next to "Plutonic Media" branding). Small `LogOut` icon button that calls `supabase.auth.signOut()` and navigates to `/auth`.

**Files:** `InputColumn.tsx` — add `onSignOut` prop, render LogOut icon button in header. `Index.tsx` — pass sign out handler.

## 2. Protected Route (Already Done — Verify)

`Index.tsx` already redirects to `/auth` when no session. Auth page already exists. Just verify the flow is solid — no changes needed unless broken.

## 3. Database Migration: Scoped Tables

**Migration SQL:**

```sql
-- Add scope columns to saved_models
ALTER TABLE saved_models
  ADD COLUMN IF NOT EXISTS client_id uuid,
  ADD COLUMN IF NOT EXISTS project_id uuid,
  ADD COLUMN IF NOT EXISTS scope text NOT NULL DEFAULT 'global',
  ADD COLUMN IF NOT EXISTS metadata jsonb;

-- Create saved_prompts table
CREATE TABLE saved_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  client_id uuid,
  project_id uuid,
  scope text NOT NULL DEFAULT 'global',
  name text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE saved_prompts ENABLE ROW LEVEL SECURITY;

-- RLS for saved_prompts (same pattern as saved_models)
CREATE POLICY "Users can view own saved_prompts" ON saved_prompts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own saved_prompts" ON saved_prompts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own saved_prompts" ON saved_prompts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved_prompts" ON saved_prompts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
```

## 4. Project Deletion in ClientProjectSelector

Add a `Trash2` icon next to the selected project (same pattern as client delete). Add `onDeleteProject` prop. Confirmation dialog: "Delete [project name]? This will remove all associated generations."

**Files:** `ClientProjectSelector.tsx` — add `onDeleteProject` prop, trash icon, alert dialog for projects. `DashboardLayout.tsx` — pass through `onDeleteProject`. `Index.tsx` — implement `deleteProject` handler that deletes from `projects` table, clears selection.

## 5. Cascading Client Delete

The `customers` table doesn't have FK cascading to `projects` or `generations`. The `deleteClient` handler in `Index.tsx` needs to manually delete associated data before deleting the client:

```typescript
// Delete generations for all projects under this client
const { data: clientProjects } = await supabase.from('projects').select('id').eq('customer_id', id);
if (clientProjects?.length) {
  const projectIds = clientProjects.map(p => p.id);
  await supabase.from('generations').delete().in('project_id', projectIds);
}
// Delete projects
await supabase.from('projects').delete().eq('customer_id', id);
// Delete client
await supabase.from('customers').delete().eq('id', id);
```

## 6. useScopedData Hook

Create `src/hooks/useScopedData.ts`:
- Accepts `userId`, `clientId`, `projectId`
- Fetches `saved_models` and `saved_prompts` filtered by scope hierarchy:
  - Global: `scope = 'global' AND user_id = uid`
  - Client: above + `scope = 'client' AND client_id = selectedClient`
  - Project: above + `scope = 'project' AND project_id = selectedProject`
- Returns merged lists + save/delete functions with scope assignment
- Uses `useEffect` to refetch when client/project selection changes

## 7. Customer → Client Audit

Search codebase for any remaining "customer" or "Customer" references in UI labels, comments, and variable names. Fix any found.

---

## Files Changed Summary

| Action | File |
|--------|------|
| Edit | `src/components/dashboard/InputColumn.tsx` — sign out button |
| Edit | `src/components/dashboard/ClientProjectSelector.tsx` — project delete |
| Edit | `src/components/dashboard/DashboardLayout.tsx` — pass new props |
| Edit | `src/pages/Index.tsx` — sign out, cascading delete, project delete |
| Create | `src/hooks/useScopedData.ts` |
| Migration | Add scope columns to saved_models, create saved_prompts |

