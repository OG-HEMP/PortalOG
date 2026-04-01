-- 1. Standardize the lead_status ENUM
-- Note: Running this in the Supabase SQL Editor will create the types if they don't exist
-- or add them if they do.

-- Step 1: Add new status values to the existing ENUM
ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'INTEL_READY';
ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'SYNCED';
ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'FLAGGED';

-- Step 2: Add engine_error column for debugging
ALTER TABLE public.portal_leads 
ADD COLUMN IF NOT EXISTS engine_error TEXT;

-- Step 3: Add crm_sync_approved if it doesn't exist (safety)
ALTER TABLE public.portal_leads 
ADD COLUMN IF NOT EXISTS crm_sync_approved BOOLEAN DEFAULT FALSE;

-- Step 4: Ensure JSONB defaults are clean
ALTER TABLE public.portal_leads 
ALTER COLUMN contact_info SET DEFAULT '{}'::jsonb,
ALTER COLUMN intelligence SET DEFAULT '{}'::jsonb,
ALTER COLUMN action_data SET DEFAULT '{}'::jsonb;
