import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const apolloKey = Deno.env.get("APOLLO_API_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    const { record, lead_ids } = await req.json().catch(() => ({}));

    // Target leads to process: either single trigger record or explicit batch IDs
    let targetLeads = [];
    if (record) {
      targetLeads = [record];
    } else if (lead_ids && lead_ids.length > 0) {
      const { data } = await supabase.from("portal_leads").select("*").in("id", lead_ids);
      targetLeads = data || [];
    } else {
      // Periodic fallback: fetch batch of discovered leads
      const { data } = await supabase
        .from("portal_leads")
        .select("*")
        .eq("status", "DISCOVERED")
        .limit(10);
      targetLeads = data || [];
    }

    if (targetLeads.length === 0) {
      return new Response(JSON.stringify({ message: "No targets to harden." }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    console.log(`Hardening ${targetLeads.length} leads via Apollo Enrichment...`);

    // Bulk Enrich via Apollo Multi-Email API
    const enrichmentRes = await fetch("https://api.apollo.io/v1/people/bulk_enrich", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apolloKey,
        person_ids: targetLeads.map(l => l.apollo_id).filter(Boolean)
      })
    });
    
    const enrichData = await enrichmentRes.json();
    const people = enrichData.people || [];

    const hardeningResults = targetLeads.map((lead: any) => {
      const enrichedPerson = people.find((p: any) => p.id === lead.apollo_id);
      
      // Verification logic: email_status: 'verified' or 'extrapolated'
      const isVerified = enrichedPerson?.email_status === 'verified';
      const email = enrichedPerson?.email || lead.email;
      
      const score = isVerified ? 100 : (email ? 60 : 30);
      
      return {
        id: lead.id,
        email: email,
        status: score >= 60 ? "HARDENED" : "FLAGGED",
        intelligence_data: {
          ...lead.intelligence_data,
          hardening_score: score,
          email_status: enrichedPerson?.email_status || "unknown",
          hardened_at: new Date().toISOString()
        },
        engine_error: score < 60 ? "Low confidence email/contact status" : null,
        updated_at: new Date().toISOString()
      };
    });

    // Bulk update
    const { error: updateError } = await supabase
      .from("portal_leads")
      .upsert(hardeningResults);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({
      success: true,
      count: hardeningResults.length,
      message: `Hardening complete for ${hardeningResults.length} records.`
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err: any) {
    console.error("Hardening Error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
