-- 1. Enable the http extension for external calls
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- 2. Create the unified function to invoke Edge Functions
CREATE OR REPLACE FUNCTION public.invoke_portal_engine() 
RETURNS TRIGGER AS $$
DECLARE
  engine_name TEXT;
  payload JSONB;
  resp_status INTEGER;
BEGIN
  -- Determine engine based on status
  CASE NEW.status
    WHEN 'DISCOVERED' THEN engine_name := 'hardening-engine';
    WHEN 'HARDENED' THEN engine_name := 'intelligence-engine';
    WHEN 'INTEL_READY' THEN 
      IF NEW.crm_sync_approved THEN
        engine_name := 'action-engine';
      ELSE
        RETURN NEW;
      END IF;
    ELSE RETURN NEW;
  END CASE;

  -- Prepare payload
  payload := json_build_object(
    'record', row_to_json(NEW),
    'old_record', row_to_json(OLD)
  );

  -- Perform the HTTP POST to the actual project URL
  SELECT
    status INTO resp_status
  FROM extensions.http_post(
    url := 'https://alulqqvalgprxjcaptxa.supabase.co/functions/v1/' || engine_name,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsdWxxcXZhbGdwcnhqY2FwdHhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjExMDExMiwiZXhwIjoyMDg3Njg2MTEyfQ.aEGIV8LgtFo7jN0G-dUXwJmQ3oanAPXF-P_77sDZxb4'
    ),
    body := payload::text
  );

  RAISE NOTICE 'Invoked engine % with status %', engine_name, resp_status;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create the Trigger
DROP TRIGGER IF EXISTS trigger_portal_leads_engine ON public.portal_leads;
CREATE TRIGGER trigger_portal_leads_engine
AFTER INSERT OR UPDATE OF status, crm_sync_approved
ON public.portal_leads
FOR EACH ROW
EXECUTE FUNCTION public.invoke_portal_engine();
