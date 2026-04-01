# 03 SYSTEM CAPABILITIES: Functional Specs

## 1. Discovery Engine (Apollo Search)
The engine that feeds the machine.
- **Search Logic**: Multi-criteria search (Job Title, Industry, Company Size, Revenue).
- **Auto-Deduplication**: Automatic check against the "Hardened" and "Actioned" database before importing any new lead.
- **CRM Safety Check**: Mandatory **Email-only** search in CRM. If status is `Customer`, `Active`, or `O_Won`, flag as `CRITICAL_DUPLICATE` and pause.

## 2. Hardening Engine (Verification)
The validator of lead quality.
- **Email Verification**: Asynchronous SMTP and catch-all verification.
- **Fast-Track Trigger**: If ICP Score > 9.0 AND Email is "Green" (Verifiable), the lead automatically proceeds to the Intelligence Engine without user manual handholding.

## 3. Intelligence Engine (Research)
The brain of the system.
- **Tavily Search**: Recursive search for "Company News," "Pain Points," and "Key Executive Recent Posts."
- **Gemini 1.5 Pro Analysis**: Processes the raw Tavily data into a structured JSON research object.
- **Recursive Consistency**: Uses Discovery data as a "Contextual Start" but treats different emails as a "New Lead" slate.

## 4. Action Engine (Outreach & Sync)
The hand that signs the deal.
- **Autonomous Drafting**: AI-generated email drafts based on "Intelligence" insights.
- **CRM Integration (Freshsales)**:
  - **HITL Verification**: All updates to the CRM (Title, Company, Sync) require **Human-In-The-Loop** approval before writing.
  - **Auto-Syncing**: Mapping `portal_leads` fields to `Freshsales` custom fields after approval.
- **Deployment**: One-click export to Manyreach/Gmail.
