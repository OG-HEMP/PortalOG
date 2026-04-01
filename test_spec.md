# 05 TEST PROTOCOLS: Autonomous Verification

To maintain **Portal OG** as a high-performance system, Antigravity must autonomously verify every code change using these protocols.

## 1. Unit Testing (Vitest)
Mandatory for all "Deep Modules" (Services, Hooks).
- **Service Logic**: Mock `supabase.functions.invoke`. Verify `apollo-discovery` response maps correctly to `portal_leads`.
- **State Transitions**: Test the lead state machine (e.g., "Verify a lead cannot be `ACTIONED` if not `RESEARCHED`").

## 2. Integration Testing (API Payloads)
- **Schema Validation**: Every API interaction must be tested against its `zod` schema.
- **Error Handling**: Use `vi.fn()` to simulate API failures (429, 500). Verify the "Circuit Breaker" triggers and logs the status correctly.

## 3. UI/UX Verification (Browser-Agent)
Antigravity should run these flows using the `browser-agent` skill:

### The "Fast-Track" Velocity Test
1.  **Inject** a lead via SQL with `score: 9.5` and `email_status: green`.
2.  **Verify** the UI automatically transitions the lead to `RESEARCHED` status without manual clicks.
3.  **Confirm** the Intelligence Engine log shows "Fast-Track Triggered".

### The "Safety Barrier" Test
1.  **Inject** a lead with an email that exists in the mock CRM as `Active`.
2.  **Verify** the UI immediately moves the lead to `CRITICAL_DUPLICATE`.
3.  **Verify** the "Action" button is disabled for this lead.

### The "HITL Sync" Verification
1.  **Select** a `RESEARCHED` lead.
2.  **Click** "Sync to CRM".
3.  **Confirm** the lead status moves to `ACTIONED` only *after* the simulated CRM patch succeeds.

## 4. The "Autonomous-Ready" Check
Before a PR is ready, Antigravity must:
1.  Run `npm run lint`.
2.  Run `npm test`.
3.  Execute the "Fast-Track" and "Safety Barrier" browser tests.
4.  Confirm `100% Type Safety` (no `any` in system services).
