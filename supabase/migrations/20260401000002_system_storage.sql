-- 1. System Configuration & Rate Limit Tracking
CREATE TABLE IF NOT EXISTS public.system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT UNIQUE NOT NULL, -- 'GMAIL', 'RESEND', 'MANYREACH', 'APOLLO'
  daily_limit INTEGER NOT NULL DEFAULT 50,
  current_usage INTEGER DEFAULT 0,
  last_reset_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Sync Queue for Failed Action Attempts (Circuit Breaker Persistence)
CREATE TABLE IF NOT EXISTS public.sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_lead_id UUID REFERENCES public.portal_leads(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  payload JSONB NOT NULL,
  retry_count INTEGER DEFAULT 0,
  last_error TEXT,
  next_retry_at TIMESTAMPTZ DEFAULT NOW(), 
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_queue ENABLE ROW LEVEL SECURITY;

-- 4. Initial Config Seeds
INSERT INTO public.system_config (service_name, daily_limit)
VALUES 
  ('GMAIL', 500),
  ('RESEND', 100),
  ('MANYREACH', 1000),
  ('APOLLO', 50)
ON CONFLICT (service_name) DO NOTHING;
