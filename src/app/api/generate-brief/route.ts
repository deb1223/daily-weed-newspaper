import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import Anthropic from "@anthropic-ai/sdk";
import { Resend } from "resend";

// Required Supabase table (create once in dashboard):
// CREATE TABLE daily_briefs (
//   date date PRIMARY KEY,
//   brief_json jsonb NOT NULL,
//   status text DEFAULT 'draft',
//   created_at timestamptz DEFAULT now()
// );

export const maxDuration = 60;

interface BriefJson {
  intro: string;
  dealCommentary: { productId: string; quip: string }[];
  savageCorner: string;
  bigMikeTea: string[];
  touristTerry: string;
  marketRating: number;
  ratingQuote: string;
}

function buildDataContext(data: {
  topDeals: { name: string; brand: string | null; category: string; price: number; original_price: number | null; discountPct: number; dispensaryName: string }[];
  categoryWinners: { label: string; name: string | null; price: number | null; dispensaryName: string | null }[];
  stripDeals: { name: string; price: number; original_price: number | null; discountPct: number; dispensaryName: string }[];
  avgByCategory: { category: string; avg: number }[];
  stats: { totalProducts: number; dispensaryCount: number; onSaleCount: number; minPrice: number; avgPrice: number };
}): string {
  return `
TODAY'S MARKET STATS:
- ${data.stats.totalProducts.toLocaleString()} total products tracked across ${data.stats.dispensaryCount} dispensaries
- ${data.stats.onSaleCount.toLocaleString()} items on sale right now
- Cheapest product: $${data.stats.minPrice.toFixed(2)}
- Average price: $${data.stats.avgPrice.toFixed(2)}

TOP DEALS BY DISCOUNT:
${data.topDeals.map((d, i) => `${i + 1}. "${d.name}"${d.brand ? ` by ${d.brand}` : ""} at ${d.dispensaryName} — $${d.price.toFixed(2)} (was $${d.original_price?.toFixed(2)}) · ${d.discountPct}% off`).join("\n")}

CATEGORY PRICE WINNERS:
${data.categoryWinners.map(w => `- ${w.label}: ${w.name ?? "none"} at ${w.dispensaryName ?? "unknown"} — $${w.price?.toFixed(2) ?? "N/A"}`).join("\n")}

STRIP DISPENSARY DEALS:
${data.stripDeals.length > 0 ? data.stripDeals.map(d => `- "${d.name}" at ${d.dispensaryName} — $${d.price.toFixed(2)} (${d.discountPct}% off)`).join("\n") : "No current strip deals."}

AVERAGE PRICE BY CATEGORY:
${data.avgByCategory.map(c => `- ${c.category}: $${c.avg.toFixed(2)}`).join("\n")}
`.trim();
}

function briefToEmailHtml(date: string, brief: BriefJson): string {
  return `
<h2>Ziggy's Daily Brief — ${date}</h2>
<h3>Intro</h3>
<p>${brief.intro}</p>

<h3>Deal Commentary</h3>
<ul>
${brief.dealCommentary.map(d => `<li><strong>${d.productId}</strong>: ${d.quip}</li>`).join("\n")}
</ul>

<h3>Savage Corner</h3>
<p>${brief.savageCorner}</p>

<h3>Big Mike's Tea (3 gossip items)</h3>
<ol>
${brief.bigMikeTea.map(t => `<li>${t}</li>`).join("\n")}
</ol>

<h3>Tourist Terry's Tip</h3>
<p>${brief.touristTerry}</p>

<h3>Market Rating</h3>
<p><strong>${brief.marketRating}/10</strong></p>
<p><em>"${brief.ratingQuote}"</em></p>

<hr>
<p style="font-size:12px;color:#666;">
  To publish: POST /api/publish-brief with { date: "${date}", secret: CRON_SECRET }
</p>
  `.trim();
}

export async function GET(req: NextRequest) {
  // Verify Vercel cron authorization
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // Check if already generated today
  const { data: existing } = await supabase
    .from("daily_briefs")
    .select("date")
    .eq("date", today)
    .single();

  if (existing) {
    return NextResponse.json({ message: "Brief already generated for today", date: today });
  }

  // Fetch market data
  const [
    { data: dealsData },
    { data: winnersData },
    { data: statsRows },
    { data: avgData },
    { data: stripData },
  ] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, brand, category, price, original_price, dispensaries(name)")
      .eq("on_sale", true)
      .eq("in_stock", true)
      .not("original_price", "is", null)
      .not("price", "is", null)
      .order("price", { ascending: true })
      .limit(50),
    supabase
      .from("products")
      .select("name, price, category, dispensaries(name)")
      .eq("in_stock", true)
      .not("price", "is", null)
      .order("price", { ascending: true })
      .limit(100),
    supabase
      .from("products")
      .select("price")
      .eq("in_stock", true)
      .not("price", "is", null)
      .limit(3000),
    supabase
      .from("products")
      .select("category, price")
      .eq("in_stock", true)
      .not("price", "is", null)
      .limit(5000),
    supabase
      .from("products")
      .select("name, price, original_price, dispensaries(name)")
      .in("dispensary_id", [
        "b70e2850-8095-4791-8700-7ea8633b6d72",
        "98d7d2a6-7ef1-46a2-9c95-b2e1f93ff805",
      ])
      .eq("in_stock", true)
      .eq("on_sale", true)
      .not("original_price", "is", null)
      .limit(20),
  ]);

  // Process deals
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const topDeals = ((dealsData ?? []) as any[])
    .map((p) => {
      const orig = Number(p.original_price);
      const sale = Number(p.price);
      const discountPct = orig > 0 && sale > 0 && orig > sale
        ? Math.round(((orig - sale) / orig) * 100) : 0;
      return { ...p, discountPct, dispensaryName: p.dispensaries?.name ?? "Unknown" };
    })
    .filter((p) => p.discountPct >= 10)
    .sort((a, b) => b.discountPct - a.discountPct)
    .slice(0, 5);

  // Process stats
  const prices = (statsRows ?? []).map((r) => Number(r.price)).filter((n) => n > 0);
  const stats = {
    totalProducts: prices.length,
    dispensaryCount: 16,
    onSaleCount: topDeals.length,
    minPrice: prices.length ? Math.min(...prices) : 0,
    avgPrice: prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0,
  };

  // Process avg by category
  const grouped: Record<string, number[]> = {};
  for (const p of avgData ?? []) {
    const cat = String(p.category);
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(Number(p.price));
  }
  const avgByCategory = Object.entries(grouped)
    .map(([cat, ps]) => ({ category: cat, avg: ps.reduce((a, b) => a + b, 0) / ps.length }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 5);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stripDeals = ((stripData ?? []) as any[]).map((p) => {
    const orig = Number(p.original_price);
    const sale = Number(p.price);
    return {
      name: p.name,
      price: sale,
      original_price: orig,
      discountPct: orig > 0 && sale > 0 && orig > sale ? Math.round(((orig - sale) / orig) * 100) : 0,
      dispensaryName: p.dispensaries?.name ?? "Strip",
    };
  }).filter((p) => p.discountPct > 0).slice(0, 4);

  const dataContext = buildDataContext({
    topDeals,
    categoryWinners: (winnersData ?? []).slice(0, 5).map((w: any) => ({
      label: w.category ?? "Unknown",
      name: w.name,
      price: Number(w.price),
      dispensaryName: w.dispensaries?.name ?? null,
    })),
    stripDeals,
    avgByCategory,
    stats,
  });

  // Call Claude
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let brief: BriefJson;
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: `You are Ziggy, lead writer of the Daily Weed Newspaper. You've been smoking since 14, calling out mid since 15. Your voice is savage Gen-Z, funny-first, zero corporate energy. You write short punchy commentary — never more than 2 sentences per item. You call out bad prices, celebrate real deals, roast dispensaries that deserve it. You are not mean to people, only to bad prices. You always respond with valid JSON only — no markdown, no preamble, just the JSON object.`,
      messages: [
        {
          role: "user",
          content: `Based on today's Las Vegas cannabis market data, write Ziggy's daily brief.

Market data:
${dataContext}

Return ONLY a valid JSON object with exactly these fields (no markdown, no code blocks, raw JSON only):
{
  "intro": "2-3 sentence Ziggy opener for today based on the actual data",
  "dealCommentary": [
    {"productId": "product name from top deals", "quip": "one punchy Ziggy sentence"}
  ],
  "savageCorner": "one Ziggy paragraph roasting something real from the data",
  "bigMikeTea": [
    "one gossip sentence about a dispensary based on data",
    "second gossip sentence",
    "third gossip sentence"
  ],
  "touristTerry": "one practical Terry tip based on strip deals today",
  "marketRating": 7.5,
  "ratingQuote": "one sentence Ziggy quote explaining the rating"
}`,
        },
      ],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "{}";
    const cleaned = raw.replace(/^```json?\n?/, "").replace(/\n?```$/, "").trim();
    brief = JSON.parse(cleaned);
  } catch (e) {
    console.error("[generate-brief] Claude error:", e);
    return NextResponse.json({ error: "LLM generation failed" }, { status: 500 });
  }

  // Store in Supabase
  const { error: insertError } = await supabase
    .from("daily_briefs")
    .upsert({ date: today, brief_json: brief, status: "draft" });

  if (insertError) {
    console.error("[generate-brief] DB error:", insertError);
    return NextResponse.json({ error: "DB insert failed" }, { status: 500 });
  }

  // Email Dan
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "Daily Weed Newspaper <noreply@dailyweednewspaper.com>",
    to: "danieledwardbeecher@gmail.com",
    subject: `Ziggy's daily brief is ready for review — ${today}`,
    html: briefToEmailHtml(today, brief),
  }).catch((e) => console.error("[generate-brief] Email failed:", e));

  return NextResponse.json({ success: true, date: today, status: "draft" });
}
