# Complete Autonomous Pipeline Implementation Plan (Phases 3-5)

> **For Antigravity:** REQUIRED SUB-SKILL: Load executing-plans to implement this plan task-by-task.

**Goal:** Transition Portal OG from a Discovery tool to a fully autonomous pipeline that hardens leads, generates research-based intelligence, and syncs to the CRM.

**Architecture:** A series of Supabase Edge Functions acting as the 'Engines' in the 4-engine model. Each engine picks up records based on status ENUMs.

---

### Task 1: Hardening Engine (Phase 3)
*Status Shift: DISCOVERED -> HARDENED*

**Files:**
- Create: `supabase/functions/hardening-engine/index.ts`
- Modify: `App.tsx` (Status monitor)

**Step 1: Implement the Hardener**
- Function should take a batch of `DISCOVERED` leads.
- Perform email syntax validation and LinkedIn profile health checks (via Apollo person data).
- Update status to `HARDENED`.

---

### Task 2: Intelligence Engine (Phase 4)
*Status Shift: HARDENED -> INTEL_READY*

**Files:**
- Create: `supabase/functions/intelligence-engine/index.ts`

**Step 1: Integrate Tavily & Gemini**
- For each `HARDENED` lead, search the company on Tavily for "recent news" or "hiring updates".
- Send the search context + user prompt to Gemini (1.5 Flash).
- Generate a 1-sentence "Intelligence Insight".
- Store in `intelligence_data` JSONB and update status to `INTEL_READY`.

---

### Task 3: Action Engine (Phase 5)
*Status Shift: INTEL_READY -> SYNCED*

**Files:**
- Create: `supabase/functions/action-engine/index.ts`

**Step 1: Freshsales CRM Sync**
- Reach out to Freshsales API.
- Upsert the lead into CRM.
- Map the "Intelligence Insight" to the user-selected custom field.
- Update status to `SYNCED`.

---

### Task 4: Command Center Reactive UI

**Files:**
- Modify: `App.tsx`
- Modify: `src/hooks/useEngineStats.ts`

**Step 1: Create Real-time Stats Hook**
- Subscribe to `portal_leads` changes.
- Calculate counts for each status: `DISCOVERED`, `HARDENED`, `INTEL_READY`, `SYNCED`.

**Step 2: Update "Engine Latency Track"**
- Display current counts in the sidebar cards instead of "IDLE".
- Change "IDLE" to "PROCESSING" or "X READY" dynamically.

---

### Task 5: Launch & Verification

**Step 1: Provide Deploy Command**
- Provide a single script to deploy all 3 remaining functions.
- Run a smoke test starting from Discovery.
