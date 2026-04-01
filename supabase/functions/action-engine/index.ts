import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const freshsalesKey = Deno.env.get("FRESHSALES_API_KEY");
const freshsalesDomain = Deno.env.get("FRESHSALES_DOMAIN");
const resendKey = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    const { record, lead_ids } = await req.json().catch(() => ({}));

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
        .limit(5);
      targetLeads = data || [];
    }

    if (targetLeads.length === 0) {
      return new Response(JSON.stringify({ message: "Zero leads ready for action." }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    console.log(`Executing Action Engine for ${targetLeads.length} leads...`);

    const actionResults = [];

    for (const lead of targetLeads) {
      try {
        // 1. CRM Sync Logic (Search then Upsert)
        if (freshsalesKey && freshsalesDomain) {
          const baseUrl = `https://${freshsalesDomain}.freshsales.io/api`;
          const authHeaders = { 'Authorization': `Token token=${freshsalesKey}`, 'Content-Type': 'application/json' };

          // Search for existing contact
          const searchRes = await fetch(`${baseUrl}/lookup?email=${encodeURIComponent(lead.email)}&entities=contact`, {
            headers: authHeaders
          });
          const searchData = await searchRes.json();
          const existingContact = searchData.contacts?.contacts?.[0];

          const crmPayload = {
            first_name: lead.first_name,
            last_name: lead.last_name,
            email: lead.email,
            job_title: lead.job_title,
            company: { name: lead.company_name },
            custom_field: {
              cf_ice_breaker: lead.intelligence?.outreach_hook || "",
              cf_pain_points: lead.intelligence?.potential_pain || "",
              cf_holographic_research: lead.intelligence?.growth_signal || "",
              cf_icp_score: lead.intelligence?.icp_score?.toString() || "0"
            }
          };

          if (existingContact) {
            console.log(`Updating existing contact ${existingContact.id} for ${lead.email}`);
            await fetch(`${baseUrl}/contacts/${existingContact.id}`, {
              method: "PUT",
              headers: authHeaders,
              body: JSON.stringify({ contact: crmPayload })
            });
          } else {
            console.log(`Creating new contact for ${lead.email}`);
            await fetch(`${baseUrl}/contacts`, {
              method: "POST",
              headers: authHeaders,
              body: JSON.stringify({ contact: crmPayload })
            });
          }
        }

        // 2. Outreach Trigger (Placeholder for Resend)
        // Note: In an autonomous pipeline, you might want to wait for manual approval 
        // unless lead.crm_sync_approved is true. For now, we sync and transition.

        actionResults.push({
          id: lead.id,
          status: "SYNCED",
          action_data: {
            ...lead.action_data,
            synced_to_crm: true,
            last_synced_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        });

      } catch (innerErr) {
        console.error(`Action Failure for ${lead.id}:`, innerErr.message);
        actionResults.push({
          id: lead.id,
          status: "FLAGGED",
          action_data: {
            ...lead.action_data,
            last_error: innerErr.message
          },
          updated_at: new Date().toISOString()
        });
      }
    }

    if (actionResults.length > 0) {
      const { error: updateError } = await supabase
        .from("portal_leads")
        .upsert(actionResults, { onConflict: "id" });
      if (updateError) throw updateError;
    }

    return new Response(JSON.stringify({ success: true, count: actionResults.length }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err: any) {
    console.error("Action Engine Critical Error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
