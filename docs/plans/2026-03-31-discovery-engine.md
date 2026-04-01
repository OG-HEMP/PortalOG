# Phase 2: Discovery Engine Implementation Plan

> **For Antigravity:** REQUIRED SUB-SKILL: Load executing-plans to implement this plan task-by-task.

**Goal:** Implement the autonomous Discovery Engine that sources leads from Apollo and hydrates the Portal OG holographic record store.

**Architecture:** A Supabase Edge Function will serve as the "Discovery Proxy" to handle secure API communication with Apollo, mapping raw person data to the `portal_leads` schema, and performing idempotent upserts.

**Tech Stack:** Deno (Edge Functions), Supabase SDK, Apollo API, React (Vite).

---

### Task 1: Edge Function Deployment & DB Permissions

**Files:**
- Create: `supabase/functions/discovery-engine/index.ts`
- Modify: `supabase/migrations/20260331000001_discovery_permissions.sql`

**Step 1: Write the Edge Function logic (Hydration)**
Accept `job_titles`, `industries`, and `revenue`. Call Apollo. Map to `portal_leads`. 

**Step 2: Add RLS policy for the Function**
Ensure 'service_role' can upsert.

**Step 3: Deploy Function**
Run: `supabase functions deploy discovery-engine`

---

### Task 2: Frontend Connector Implementation

**Files:**
- Modify: `App.tsx`
- Create: `src/hooks/useDiscovery.ts`

**Step 1: Create the Discovery Hook**
Hook to `supabase.functions.invoke('discovery-engine')`.

**Step 2: Update App.tsx "Run Discovery Pool" Button**
Connect UI to hook. Implement loading and success states.

---

### Task 3: Apollo Logic & Filter Hardening

**Files:**
- Modify: `supabase/functions/discovery-engine/index.ts`

**Step 1: Implement robust error handling**
Handle Apollo credit depletion or invalid API key errors specifically.

**Step 2: Add de-duplication logic (On Conflict)**
Ensure `upsert` in the Edge Function handles `email` conflicts by updating the `updated_at` field.

---

### Task 4: Verification & Smoke Test

**Step 1: Trigger run from UI**
Click "Run Discovery Pool" with specific filters.

**Step 2: Verify DB Records**
`select count(*) from portal_leads where status = 'DISCOVERED'`
Expected: > 0 records.
