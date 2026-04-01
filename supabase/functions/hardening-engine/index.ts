import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const apolloKey = Deno.env.get("APOLLO_API_KEY");

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
        .eq("status", "DISCOVERED")
        .limit(10);
      targetLeads = data || [];
    }

    if (targetLeads.length === 0) {
      return new Response(JSON.stringify({ message: "Zero leads to harden." }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    console.log(`Hardening batch of ${targetLeads.length} via Apollo...`);

    // Extract Apollo IDs or emails for enrichment
    const enrichBody = {
      api_key: apolloKey,
      person_ids: targetLeads.map(l => l.contact_info?.apollo_id).filter(Boolean),
      emails: targetLeads.map(l => l.email).filter(e => !targetLeads.find(l2 => l2.email === e)?.contact_info?.apollo_id)
    };

    const enrichmentRes = await fetch("https://api.apollo.io/v1/people/bulk_enrich", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(enrichBody)
    });
    
    const enrichData = await enrichmentRes.json();
    const people = enrichData.people || [];

    const hardeningUpdates = targetLeads.map((lead: any) => {
      const p = people.find((pers: any) => pers.email === lead.email || pers.id === lead.contact_info?.apollo_id);
      
      const isVerified = p?.email_status === 'verified';
      const score = isVerified ? 100 : (p?.email ? 70 : 40);
      
      // Map back to schema: intelligence, contact_info
      return {
        id: lead.id,
        status: score >= 70 ? "HARDENED" : "FLAGGED",
        contact_info: {
          ...lead.contact_info,
          email_status: p?.email_status || lead.contact_info?.email_status,
          phone: p?.phone_number || lead.contact_info?.phone,
          organization: p?.organization || null,
          verification_report: {
            source: "apollo_bulk_enrich",
            timestamp: new Date().toISOString(),
            confidence_score: score
          }
        },
        intelligence: {
          ...lead.intelligence,
          hardening_score: score,
          last_hardened_at: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      };
    });

    const { error: updateError } = await supabase
      .from("portal_leads")
      .upsert(hardeningUpdates, { onConflict: "id" });

    if (updateError) throw updateError;

    return new Response(JSON.stringify({
      success: true,
      modified: hardeningUpdates.length
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err: any) {
    console.error("Hardening Error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
