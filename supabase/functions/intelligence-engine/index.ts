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
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    const { record, lead_ids } = await req.json().catch(() => ({}));

    if (!geminiKey || !tavilyKey) throw new Error("Missing AI API Keys in environment.");

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
        .eq("status", "HARDENED")
        .limit(5);
      targetLeads = data || [];
    }

    if (targetLeads.length === 0) {
      return new Response(JSON.stringify({ message: "Zero leads ready for AI synthesis." }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    console.log(`Starting Intelligence Cycle for ${targetLeads.length} leads...`);

    const intelligenceResults = [];

    for (const lead of targetLeads) {
      try {
        // 1. Tavily Research (Focused on Triggers)
        const searchQuery = `"${lead.company_name}" latest news funding expansion product launch 2024 2025`;
        const tavilyRes = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: tavilyKey,
            query: searchQuery,
            search_depth: "advanced",
            max_results: 5
          })
        });
        const searchData = await tavilyRes.json();
        const rawContent = searchData.results?.map((r: any) => `${r.title}: ${r.content}`).join("\n\n");

        // 2. Gemini Holographic Synthesis
        const prompt = `
          ACT AS: Expert Sales Intelligence Researcher.
          ENTITY: ${lead.first_name} ${lead.last_name} at ${lead.company_name}.
          RESEARCH CONTEXT:
          ${rawContent}

          GOAL: Synthesize a "Holographic Profile" for this lead.
          OUTPUT FORMAT: JSON ONLY with these fields:
          {
            "growth_signal": "One specific recent business accomplishment or change",
            "potential_pain": "One specific challenge they likely face based on news",
            "outreach_hook": "A 1-sentence personalized opening line for an email",
            "icp_score": (0-100 integer based on company growth signal)
          }
        `;

        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { response_mime_type: "application/json" }
          })
        });
        const geminiData = await geminiRes.json();
        const synthesis = JSON.parse(geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "{}");

        intelligenceResults.push({
          id: lead.id,
          status: "INTEL_READY",
          intelligence: {
            ...lead.intelligence,
            growth_signal: synthesis.growth_signal,
            potential_pain: synthesis.potential_pain,
            outreach_hook: synthesis.outreach_hook,
            icp_score: synthesis.icp_score || 50,
            tavily_raw: rawContent.substring(0, 5000), // Cap size
            last_researched_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        });

      } catch (innerErr) {
        console.error(`Lead ${lead.id} Intel Failure:`, innerErr.message);
        intelligenceResults.push({
          id: lead.id,
          status: "FLAGGED",
          intelligence: {
             ...lead.intelligence,
             error: innerErr.message
          },
          updated_at: new Date().toISOString()
        });
      }
    }

    if (intelligenceResults.length > 0) {
      const { error: updateError } = await supabase
        .from("portal_leads")
        .upsert(intelligenceResults, { onConflict: "id" });
      if (updateError) throw updateError;
    }

    return new Response(JSON.stringify({ success: true, processed: intelligenceResults.length }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err: any) {
    console.error("Intelligence Engine Critical Error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
