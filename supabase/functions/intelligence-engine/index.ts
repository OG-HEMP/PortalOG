import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const geminiKey = Deno.env.get("GEMINI_API_KEY");
const tavilyKey = Deno.env.get("TAVILY_API_KEY");

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

    if (!geminiKey || !tavilyKey) throw new Error("GEMINI_API_KEY or TAVILY_API_KEY not configured.");

    // Target leads to process: either single trigger record or explicit batch IDs
    let targetLeads = [];
    if (record) {
      targetLeads = [record];
    } else if (lead_ids && lead_ids.length > 0) {
      const { data } = await supabase.from("portal_leads").select("*").in("id", lead_ids);
      targetLeads = data || [];
    } else {
      // Periodic fallback: fetch batch of hardened leads
      const { data } = await supabase
        .from("portal_leads")
        .select("*")
        .eq("status", "HARDENED")
        .limit(5);
      targetLeads = data || [];
    }

    if (targetLeads.length === 0) {
      return new Response(JSON.stringify({ message: "No targets for intelligence cycle." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const results = [];

    for (const lead of targetLeads) {
      console.log(`Deep Researching: ${lead.company_name} (${lead.first_name})...`);

      try {
        // 1. Tavily Search for Company News
        const tavilyResponse = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: tavilyKey,
            query: `recent news, hiring, or growth updates for ${lead.company_name} ${lead.industry || ''}`,
            search_depth: "basic",
            max_results: 3
          })
        });
        const searchData = await tavilyResponse.json();
        const context = searchData.results?.map((r: any) => r.content).join("\n") || "No recent news found.";

        // 2. Gemini Analysis & Insight Generation
        const prompt = `Analyze this research about company "${lead.company_name}":\n\n${context}\n\nLead Info: ${lead.first_name} ${lead.last_name}, ${lead.job_title || 'Professional'}.\n\nGOAL: Write a one-sentence, highly personalized intelligence insight for our sales team. Focus on a recent growth signal or business pain point mentioned in the news. Keep it under 25 words.`;

        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });
        const geminiData = await geminiResponse.json();
        const insight = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "Ready for outreach.";

        results.push({
          id: lead.id,
          status: "INTEL_READY",
          intelligence_data: {
            ...lead.intelligence_data,
            tavily_context: context,
            gemini_insight: insight,
            researched_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        });
      } catch (innerErr) {
        console.error(`Error processing lead ${lead.id}:`, innerErr.message);
        results.push({
          id: lead.id,
          engine_error: `Intelligence failed: ${innerErr.message}`,
          updated_at: new Date().toISOString()
        });
      }
    }

    // Update leads
    if (results.length > 0) {
      const { error: updateError } = await supabase
        .from("portal_leads")
        .upsert(results);

      if (updateError) throw updateError;
    }

    return new Response(JSON.stringify({
      success: true,
      count: results.length,
      message: `Intelligence complete for ${results.length} leads.`
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err: any) {
    console.error("Intelligence Error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
