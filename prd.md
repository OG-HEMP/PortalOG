# 01 PRD UNIFIED: Portal OG

## Mission Statement
To transform **LeadOG** into **Portal OG**, a unified, high-performance command center for autonomous outbound prospecting.

## The Problem (Current State)
- **Fragmented User Journey**: `Outbound.tsx`, `Organizer.tsx`, and `EmailDrafter.tsx` exist as separate pages requiring manual context switching.
- **Synchronous Bottlenecks**: Discovery and enrichment are triggered manually, blocking the UI.
- **Manual Data Reconciliation**: CRM synchronization is handled via discrete "Jobs" rather than an always-on data flow.

## The Solution: The 4-Engine Model
Portal OG will unify all logic into four specialized autonomous engines:

1.  **Discovery Engine (Apollo-Powered)**
    - *Purpose*: Identify and source the highest-value ICP matches.
    - *Transition*: Move from manual search triggers to a background task-based queue.

2.  **Hardening Engine (Verification & Enrichment)**
    - *Purpose*: Verify contact accuracy (Email/Phone) and "harden" data against bounces.
    - *Transition*: Automatic background hardening after discovery.

3.  **Intelligence Engine (Tavily/Gemini Research)**
    - *Purpose*: Map company pain points, recent news, and ICP-specific insights.
    - *Transition*: Perform recursive deep-research on every "hardened" contact autonomously.

4.  **Action Engine (Outreach & CRM Sync)**
    - *Purpose*: Generate personalized outreach (Manyreach/Gmail) and sync with CRMs (Freshsales).
    - *Transition*: Real-time, bi-directional sync ensuring no data loss.

## Success Metrics
- **Zero-Manual-Entry**: 90% of lead progression occurs without manual intervention.
- **100% Data Integrity**: Mandatory validation before any lead is "Actioned."
- **Performance**: Lead discovery-to-research-ready in < 3 minutes.
