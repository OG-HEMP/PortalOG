-- 1. Create the Unified Lead Status ENUM (Idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_status') THEN
        CREATE TYPE lead_status AS ENUM (
          'DISCOVERED',
          'HARDENED',
          'RESEARCHED',
          'ACTIONED',
          'CRITICAL_DUPLICATE'
        );
    END IF;
END
$$;

-- 2. Create the Unified Holographic Table
CREATE TABLE IF NOT EXISTS public.portal_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status lead_status NOT NULL DEFAULT 'DISCOVERED',
  crm_sync_approved BOOLEAN DEFAULT FALSE,
  
  -- Unified Contact Info (Deduplication Shield)
  email TEXT UNIQUE,
  linkedin_url TEXT,
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  
  -- Engine Results (JSONB for future flexibility)
  contact_info JSONB DEFAULT '{
    "phone": null, 
    "email_status": "unverified",
    "verification_report": null
  }'::jsonb,
  
  intelligence JSONB DEFAULT '{
    "tavily_raw": null, 
    "gemini_analysis": null, 
    "icp_score": 0,
    "last_researched_at": null
  }'::jsonb,
  
  action_data JSONB DEFAULT '{
    "email_draft": null, 
    "external_crm_id": null, 
    "manyreach_campaign": null,
    "sync_error": null
  }'::jsonb,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS (Safety first)
ALTER TABLE public.portal_leads ENABLE ROW LEVEL SECURITY;

-- 4. Safety Indexes
CREATE INDEX IF NOT EXISTS idx_portal_leads_status ON public.portal_leads (status);
CREATE INDEX IF NOT EXISTS idx_portal_leads_email ON public.portal_leads (email);
