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
    const body = await req.json();
    const { job_titles, industries, revenue } = body;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (!apolloKey) throw new Error("APOLLO_API_KEY is not configured.");

    // Normalize inputs (handle string or array)
    const titles = Array.isArray(job_titles) ? job_titles : job_titles.split(",").map((t: string) => t.trim());
    const tags = Array.isArray(industries) ? industries : industries.split(",").map((i: string) => i.trim());

    console.log(`Searching Apollo for ${titles} in ${tags}...`);

    const apolloRes = await fetch("https://api.apollo.io/v1/mixed_people/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
      body: JSON.stringify({
        api_key: apolloKey,
        person_titles: titles,
        q_organization_keyword_tags: tags,
        page: 1,
        per_page: 10
      })
    });

    const data = await apolloRes.json();
    const people = data.people || [];

    const leadUnits = people.map((p: any) => ({
      first_name: p.first_name || "Unknown",
      last_name: p.last_name || "",
      email: p.email,
      company_name: p.organization?.name || "Unknown",
      job_title: p.title || "N/A",
      industry: p.organization?.industry || "N/A",
      status: "DISCOVERED",
      discovery_data: { 
        apollo_id: p.id,
        linkedin_url: p.linkedin_url,
        sourced_at: new Date().toISOString()
      },
      hardening_score: 0,
      intelligence_data: {},
      action_data: {}
    })).filter((l: any) => l.email); // Must have email

    if (leadUnits.length > 0) {
      const { error: upsertError } = await supabase
        .from("portal_leads")
        .upsert(leadUnits, { onConflict: "email" });

      if (upsertError) throw upsertError;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      count: leadUnits.length,
      message: `Sourced ${leadUnits.length} new units from Apollo pool.`
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err: any) {
    console.error("Discovery Error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
