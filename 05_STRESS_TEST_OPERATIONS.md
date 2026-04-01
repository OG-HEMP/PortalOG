# 05 STRESS TEST & OPERATIONS

This document outlines the critical failure points of the **Portal OG** autonomous pipeline, centralizes API key requirements, and provides a strategy for the one-time seed migration to a new Supabase project.

## 1. Engine Failure Points & Mitigation

### A. Discovery Engine (Apollo / Phantombuster)
- **Failure Point**: API Rate Limiting or Credit Exhaustion.
- **Risk**: Discovery pipeline stalls; incomplete lead batches.
- **Mitigation**: Implement `credit_buffer` check in `DiscoveryEngine`. If credits < 100, pause and alert.
- **Data Risk**: Duplicate leads across different Apollo searches.
- **Mitigation**: Strict `Unique(email)` constraint in `portal_leads` table + RPC `check_lead_existence` before insertion.

### B. Hardening Engine (Verification)
- **Failure Point**: High False Positives on "Catch-All" domains.
- **Risk**: Sending emails to invalid addresses, damaging sender reputation.
- **Mitigation**: Tag domains as `is_catch_all`. Force manual review for high-value leads on catch-all domains.
- **Failure Point**: SMTP Handshake timeouts.
- **Risk**: Leads stuck in `HARDENING` state.
- **Mitigation**: Global 10s timeout per lead; mark as `HARDEN_TIMEOUT` and retry once after 1 hour.

### C. Intelligence Engine (Tavily / Gemini)
- **Failure Point**: Tavily "Hallucination" (fetching news for a different company with a similar name).
- **Risk**: Irrelevant or embarrassing email draft content.
- **Mitigation**: Inject `company_domain` into Tavily search query: `site:{domain} AND {person_name} news`.
- **Failure Point**: Gemini Context Overflow (Warm Mode).
- **Risk**: CRM history too long for the prompt window.
- **Mitigation**: Summarize CRM activities into a "Holographic Context" string (< 2000 tokens) before passing to Gemini.

### D. Action Engine (Drafting / Sync)
- **Failure Point**: Freshsales API "Write Lock" or Version Mismatch.
- **Risk**: Loss of data integrity during CRM sync.
- **Mitigation**: Use `ETag` or `updated_at` check before patching Freshsales. Implement "Sync Queue" for failed patches.
- **Failure Point**: Gmail/Manyreach Token Expired.
- **Risk**: Outbound flow stops silently.
- **Mitigation**: Webhook alert on `401 Unauthorized` in `ActionEngine`.

---

## 2. API Key Inventory

| Service | Key Name | Usage |
| :--- | :--- | :--- |
| **Apollo** | `APOLLO_API_KEY` | Lead discovery and search. |
| **Apollo** | `APOLLO_ENRICH_API_KEY` | Contact and organization enrichment. |
| **Tavily** | `TAVILY_API_KEY` | Recursive internet research and news fetching. |
| **Google** | `GEMINI_API_KEY` | LLM analysis, signal extraction, and email drafting. |
| **Freshsales** | `FRESHSALES_API_KEY` | CRM proxy access (Mirroring and Sync). |
| **Freshsales** | `FRESHSALES_DOMAIN` | Target CRM instance (e.g., `oghemp.freshsales.io`). |
| **Phantombuster**| `PHANTOMBUSTER_API_KEY` | specialized scraping/discovery workflows. |
| **Manyreach** | `MANYREACH_API_KEY` | Cold outbound automation and campaign management. |
| **Google Cloud** | `GMAIL_CLIENT_ID` | OAuth2 for Action Engine (Drafting). |
| **Google Cloud** | `GMAIL_CLIENT_SECRET` | OAuth2 for Action Engine (Drafting). |
| **Google Cloud** | `GMAIL_REFRESH_TOKEN` | OAuth2 persistent access for Gmail. |

> [!CAUTION]
> **Supabase Connectivity**: Supabase-specific keys (`SUPABASE_URL`, `SERVICE_ROLE_KEY`) are NOT included in this manifest as we are moving to a new project instance.

---

## 3. One-Time Seed & Migration Plan

The transition from the current "LeadOG" project to the new "Portal OG" project involves a specific one-time data seed.

### Step 1: Data Extraction (Service Role)
Run a script to extract all `outbound_leads` and `crm_organizer_job_rows` from the current project.
```bash
# Example Export Command
supabase db dump --data-only --table public.outbound_leads > leads_seed.sql
```

### Step 2: Data Cleansing & Mapping
Transform the legacy data into the new `portal_leads` format:
- Map `outbound_leads.status` -> `portal_leads.status` (using the new ENUM).
- Unify `contact_info` (Email, LinkedIn) into a single JSONB field.
- Remove old `lock_flags` to allow the new engines to claim the leads.

### Step 3: New Project Initialization
1. Create the new Supabase project.
2. Apply the `portal_leads_schema.sql` migration.
3. Import the `leads_seed.sql`.

### Step 4: Double-Deduplication (The "Shield")
Immediately run a "Hardening Pass" on all imported leads to verify:
1. They exist in the new CRM Mirror.
2. They do not have conflicting `external_crm_id` mappings.

---

## 4. System Constraints
- **Max Batch Size**: 50 leads per loop (Engine safety).
- **TTL (Time To Live)**: Research data expires after 30 days.
- **HITL Enforcement**: No CRM Write operation allowed without `crm_sync_approved = true`.
