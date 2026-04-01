# 04 ARCHITECTURE HOLOGRAPH: Unified State

## 1. The Unified Database Table: `portal_leads`
The current `outbound_leads` and `crm_organizer_job_rows` were separate objects. In **Portal OG**, every lead is a single "Holographic Record."

### Table Structure (Extended)
| Field | Type | Description |
|---|---|---|
| `id` | `UUID` | Primary Key |
| `status` | `ENUM` | `DISCOVERED`, `HARDENED`, `RESEARCHED`, `ACTIONED`, `CRITICAL_DUPLICATE` |
| `crm_sync_approved` | `BOOLEAN` | User approval flag for Freshsales writeback |
| `contact_info` | `JSONB` | Email, LinkedIn, Phone (Verified Flag) |
| `intelligence` | `JSONB` | Tavily outcomes, Gemini analysis |
| `action_data` | `JSONB` | Email draft, CRM Sync status (Freshsales ID) |

## 2. The Unified State Machine
The system transitions leads through a linear pipeline with safety branches:

1.  **DISCOVERED**: Lead identified from Apollo. **Safety Check**: Email search against CRM.
2.  **CRITICAL_DUPLICATE**: (Final State) If Email matches an active CRM customer.
3.  **HARDENED**: Lead passes email/phone verification. **Fast-Track check**.
4.  **RESEARCHED**: Gemini provides analysis. **HITL Pending** for CRM Sync.
5.  **ACTIONED**: Email sent and record synced (if approved).

## 3. The HITL Sync Flow
Every data movement from Portal OG -> CRM must follow:
1.  **Engine** proposes a `diff` (JSON).
2.  **UI** surfaces a "Sync to CRM" button with the proposed changes.
3.  **User** clicks approval.
4.  **Service** executes the Freshsales API patch.

## 4. API Resilience (Circuit Breakers)
Every engine must implement a "Circuit Breaker" pattern:
- **Rate Limit Tracking**: Store API usage in a `system_config` table.
- **Fail-Safe**: If an API call (e.g., Gemini) fails 3 times, the engine marks the lead as "Retry Later" and moves to the next.
