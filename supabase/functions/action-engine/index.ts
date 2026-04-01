import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://esm.sh/zod@3";

// --- Types & Schemas ---
const ActionRequestSchema = z.object({
  record: z.any().optional(),
  lead_ids: z.array(z.string()).optional(),
  channel: z.enum(["GMAIL", "RESEND", "MANYREACH"]).default("RESEND"),
  target_field: z.string().default("cf_ice_breaker"),
});

// --- Secrets & Config ---
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const freshsalesKey = Deno.env.get("FRESHSALES_API_KEY");
const freshsalesDomain = Deno.env.get("FRESHSALES_DOMAIN");

const resendKey = Deno.env.get("RESEND_API_KEY");
const manyreachKey = Deno.env.get("MANYREACH_API_KEY");

const gmailClientId = Deno.env.get("GMAIL_CLIENT_ID");
const gmailClientSecret = Deno.env.get("GMAIL_CLIENT_SECRET");
const gmailRefreshToken = Deno.env.get("GMAIL_REFRESH_TOKEN");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// --- Helpers ---

async function refreshGmailToken() {
  console.log("[GMAIL] Refreshing access token...");
  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: gmailClientId!,
      client_secret: gmailClientSecret!,
      refresh_token: gmailRefreshToken!,
      grant_type: "refresh_token",
    }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(`Gmail token refresh failed: ${JSON.stringify(data)}`);
  return data.access_token;
}

async function checkRateLimit(supabase: any, service: string) {
  const { data, error } = await supabase
    .from("system_config")
    .select("*")
    .eq("service_name", service)
    .single();

  if (error || !data) return true; // Default to allow if not found
  if (data.current_usage >= data.daily_limit) {
    throw new Error(`Rate limit exceeded for ${service} (${data.current_usage}/${data.daily_limit})`);
  }
  return true;
}

async function incrementUsage(supabase: any, service: string) {
  await supabase.rpc("increment_service_usage", { service_name_param: service });
}

// --- Main Engine ---

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    const rawBody = await req.json().catch(() => ({}));
    const { record, lead_ids, channel, target_field } = ActionRequestSchema.parse(rawBody);

    let targetLeads = [];
    if (record) {
      targetLeads = [record];
    } else if (lead_ids && lead_ids.length > 0) {
      const { data } = await supabase.from("portal_leads").select("*").in("id", lead_ids);
      targetLeads = data || [];
    } else {
      const { data } = await supabase
        .from("portal_leads")
        .select("*")
        .eq("status", "INTEL_READY")
        .eq("crm_sync_approved", true)
        .limit(10);
      targetLeads = data || [];
    }

    if (targetLeads.length === 0) {
      return new Response(JSON.stringify({ message: "No targets for action." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    let gmailAccessToken = channel === "GMAIL" ? await refreshGmailToken() : null;
    const results = [];

    for (const lead of targetLeads) {
      console.log(`[ActionEngine] Processing ${lead.email} via ${channel}...`);

      const insight = lead.intelligence_data?.gemini_insight || "Growth opportunity identified.";
      const subject = `Growth Discussion: ${lead.company_name}`;
      const emailBody = `Hello ${lead.first_name},\n\nI was researching ${lead.company_name} and noticed: ${insight}\n\nBest,\nPortal OG Team`;

      let attempt = 0;
      let success = false;
      let lastError = "";

      while (attempt < 3 && !success) {
        attempt++;
        try {
          await checkRateLimit(supabase, channel);

          // 1. CRM Sync (Freshsales)
          if (freshsalesKey && freshsalesDomain) {
             const fsLead = {
               first_name: lead.first_name,
               last_name: lead.last_name,
               email: lead.email,
               company: { name: lead.company_name },
               custom_field: { [target_field]: insight }
             };
             await fetch(`${freshsalesDomain}/api/leads/upsert`, {
               method: "POST",
               headers: { "Authorization": `Token token=${freshsalesKey}`, "Content-Type": "application/json" },
               body: JSON.stringify({ lead: fsLead })
             });
          }

          // 2. Outreach
          if (channel === "RESEND" && resendKey) {
            await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                from: "Portal OG <ai@portal-og.com>", // Should probably be configured
                to: [lead.email],
                subject,
                text: emailBody
              })
            });
          } else if (channel === "GMAIL" && gmailAccessToken) {
            const rawMessage = btoa(`To: ${lead.email}\r\nSubject: ${subject}\r\n\r\n${emailBody}`)
              .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
            const gResp = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/drafts", {
              method: "POST",
              headers: { "Authorization": `Bearer ${gmailAccessToken}`, "Content-Type": "application/json" },
              body: JSON.stringify({ message: { raw: rawMessage } })
            });
            if (gResp.status === 401) {
               gmailAccessToken = await refreshGmailToken();
               throw new Error("Token expired, refreshed, retrying...");
            }
          } else if (channel === "MANYREACH" && manyreachKey) {
            await fetch("https://api.manyreach.com/v1/prospects/add", {
               method: "POST",
               headers: { "Authorization": `Bearer ${manyreachKey}`, "Content-Type": "application/json" },
               body: JSON.stringify({
                 email: lead.email,
                 first_name: lead.first_name,
                 last_name: lead.last_name,
                 company: lead.company_name,
                 campaign_id: lead.action_data?.manyreach_campaign // Expected from metadata
               })
            });
          }

          await incrementUsage(supabase, channel);
          success = true;
        } catch (err) {
          lastError = err.message;
          console.warn(`[ActionEngine] Attempt ${attempt} failed for ${lead.email}: ${lastError}`);
        }
      }

      if (success) {
        results.push({ id: lead.id, status: "SYNCED", action_data: { ...lead.action_data, synced_at: new Date().toISOString(), channel } });
      } else {
        await supabase.from("sync_queue").insert({
          portal_lead_id: lead.id,
          service_name: channel,
          payload: { lead, target_field },
          last_error: lastError
        });
        results.push({ id: lead.id, engine_error: `Action failed after 3 attempts: ${lastError}` });
      }
    }

    if (results.length > 0) {
       await supabase.from("portal_leads").upsert(results);
    }

    return new Response(JSON.stringify({ success: true, count: results.length }), {
       headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
