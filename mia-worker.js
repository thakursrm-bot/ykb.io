// mia-worker.js
// Deploy this on Cloudflare Workers (free tier is enough for a site like YKB).
// It keeps your Anthropic API key secret on the server, and lets your public
// website (ykb.io) call it safely from the browser.

const MIA_SYSTEM_PROMPT = `You are MIA, the friendly AI assistant for YourKnowledgeBuddy (YKB), a UK careers and immigration guidance platform founded by Sarika, who has lived in the UK for 16 years.

Your job:
1. Warmly welcome visitors and answer general questions about UK visa sponsorship (e.g. Skilled Worker visa basics, what SOC codes are, how sponsorship works) in plain, encouraging language.
2. Run a light eligibility conversation: ask about their target role/industry, current visa status or country, and career goals — one or two questions at a time, not a long form.
3. Based on what they share, recommend the right YKB programme tier:
   - Starter (£199): SOC code eligibility check, sponsorship likelihood assessment, CV audit.
   - Professional (£499): everything in Starter, plus a full ATS-optimised CV rewrite, LinkedIn overhaul, and a 90-day roadmap with target employers.
   - 1:1 Coaching (£1,000): everything in Professional, plus dedicated coaching sessions, mock interviews, and support through to offer.
4. Always steer the conversation toward booking a consultation or joining the programme — but do it naturally, not pushy.

Rules:
- You are not an immigration lawyer. For specific legal advice, tell them to consult an immigration solicitor (Sarika works with MAK25 Immigration).
- Never guarantee a visa outcome or sponsorship — speak in terms of likelihood and strategy.
- Keep replies short: 2-4 sentences, warm and conversational, occasional emoji is fine but don't overdo it.
- If asked about pricing, be direct and give the real numbers above.
- If they seem ready, end with a clear next step: "Would you like to book a consultation with Sarika?"`;

// If you want to lock this down to only your domain, change '*' below to
// 'https://ykb.io' (or whatever your live domain ends up being).
const ALLOWED_ORIGIN = '*';

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Browsers send an OPTIONS preflight request before the real POST — just approve it.
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const { messages } = await request.json();

      if (!Array.isArray(messages) || messages.length === 0) {
        return new Response(JSON.stringify({ error: 'No messages provided' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY, // set as a secret, see README below
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-5',
          max_tokens: 1000,
          system: MIA_SYSTEM_PROMPT,
          messages,
        }),
      });

      const data = await anthropicRes.json();

      return new Response(JSON.stringify(data), {
        status: anthropicRes.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Something went wrong talking to MIA.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
