import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 30;

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------

const FREE_DAILY_LIMIT = 3;

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return (forwarded?.split(",")[0] ?? "unknown").trim();
}

async function getProEmail(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get("authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return null;
  const token = auth.slice(7).trim();
  if (!token || !token.includes("@")) return null;
  const { data } = await supabase
    .from("subscribers")
    .select("email, tier")
    .eq("email", token)
    .eq("tier", "pro")
    .maybeSingle();
  return data?.email ?? null;
}

async function checkRateLimit(
  req: NextRequest
): Promise<{ allowed: boolean; remaining: number; identifier: string; isPro: boolean }> {
  const proEmail = await getProEmail(req);
  if (proEmail) {
    return { allowed: true, remaining: Infinity, identifier: proEmail, isPro: true };
  }

  const ip = getClientIp(req);
  const today = new Date().toISOString().slice(0, 10);

  const { data } = await supabase
    .from("mcp_usage")
    .select("call_count")
    .eq("identifier", ip)
    .eq("call_date", today)
    .maybeSingle();

  const count = data?.call_count ?? 0;
  const allowed = count < FREE_DAILY_LIMIT;
  return { allowed, remaining: Math.max(0, FREE_DAILY_LIMIT - count), identifier: ip, isPro: false };
}

async function recordUsage(identifier: string) {
  const today = new Date().toISOString().slice(0, 10);
  await supabase.rpc("increment_mcp_usage", { p_identifier: identifier, p_date: today });
}

// ---------------------------------------------------------------------------
// Ziggy's rate limit message
// ---------------------------------------------------------------------------

const ZIGGY_RATE_LIMIT_MESSAGE = `Hey — Ziggy here. You've burned through your 3 free lookups for today, which honestly means you're the kind of person who actually cares about their dispensary dollar. Respect.

Here's the thing: Pro subscribers get unlimited hits, the Bargain Rating before the market opens, deal rarity scores, and me, your personal AI budtender who knows every mg/$ ratio in the Las Vegas valley.

$9/month. Less than a single bad pre-roll.

Grab it at dailyweednewspaper.com/prices — scroll down to the subscribe box. See you on the other side.`;

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------

const TOOLS = [
  {
    name: "get_best_deals",
    description:
      "Returns the best cannabis deals in Las Vegas right now, ranked by THC mg per dollar. Optionally filter by category (flower, vape, edible, concentrate, pre-roll, tincture).",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description:
            "Product category to filter by. One of: flower, vape, edible, concentrate, pre-roll, tincture. Omit for all categories.",
        },
        limit: {
          type: "number",
          description: "Number of deals to return. Default 10, max 25.",
        },
      },
      required: [],
    },
  },
  {
    name: "search_products",
    description:
      "Search Las Vegas dispensary inventory by product name, brand, or strain. Returns matching products with current prices and dispensary info.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Product name, brand, or strain to search for.",
        },
        limit: {
          type: "number",
          description: "Number of results to return. Default 10, max 25.",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_dispensaries",
    description:
      "Returns all active Las Vegas dispensaries tracked by Daily Weed Newspaper, with their names and locations.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_deals_near",
    description:
      "Returns the best deals at dispensaries near a Las Vegas neighborhood or area (e.g. 'Strip', 'Henderson', 'North Las Vegas', 'Summerlin', 'Downtown').",
    inputSchema: {
      type: "object",
      properties: {
        neighborhood: {
          type: "string",
          description:
            "Las Vegas neighborhood or area name. Examples: Strip, Henderson, North Las Vegas, Summerlin, Downtown, East Las Vegas.",
        },
        limit: {
          type: "number",
          description: "Number of deals to return. Default 10, max 25.",
        },
      },
      required: ["neighborhood"],
    },
  },
];

// ---------------------------------------------------------------------------
// Tool execution
// ---------------------------------------------------------------------------

type ToolResult = { content: Array<{ type: "text"; text: string }> };

async function executeTool(name: string, args: Record<string, unknown>): Promise<ToolResult> {
  const limit = Math.min(Number(args.limit ?? 10), 25);

  if (name === "get_best_deals") {
    const category = args.category as string | undefined;
    let query = supabase
      .from("products")
      .select("name, brand, category, weight_grams, thc_percentage, thc_mg_total, price, on_sale, deal_description, mg_per_dollar, dispensaries!inner(name, city)")
      .eq("in_stock", true)
      .not("mg_per_dollar", "is", null)
      .order("mg_per_dollar", { ascending: false })
      .limit(limit);

    if (category) {
      query = query.ilike("category", `%${category}%`);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const rows = (data ?? []).map((p) => formatProduct(p));
    const text =
      rows.length === 0
        ? "No deals found for the given filters."
        : `Top ${rows.length} deals by mg/$:\n\n${rows.join("\n\n")}`;
    return { content: [{ type: "text", text }] };
  }

  if (name === "search_products") {
    const q = String(args.query ?? "").trim();
    if (!q) throw new Error("query is required");

    const { data, error } = await supabase
      .from("products")
      .select("name, brand, category, weight_grams, thc_percentage, thc_mg_total, price, on_sale, deal_description, mg_per_dollar, dispensaries!inner(name, city)")
      .eq("in_stock", true)
      .or(`name.ilike.%${q}%,brand.ilike.%${q}%`)
      .order("mg_per_dollar", { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error) throw new Error(error.message);

    const rows = (data ?? []).map((p) => formatProduct(p));
    const text =
      rows.length === 0
        ? `No products found matching "${q}".`
        : `${rows.length} result(s) for "${q}":\n\n${rows.join("\n\n")}`;
    return { content: [{ type: "text", text }] };
  }

  if (name === "get_dispensaries") {
    const { data, error } = await supabase
      .from("dispensaries")
      .select("name, city, state, status")
      .eq("status", "active")
      .order("name");

    if (error) throw new Error(error.message);

    const rows = (data ?? []).map(
      (d) => `• ${d.name} — ${d.city ?? "Las Vegas"}, ${d.state ?? "NV"}`
    );
    const text =
      rows.length === 0
        ? "No active dispensaries found."
        : `${rows.length} active dispensaries:\n\n${rows.join("\n")}`;
    return { content: [{ type: "text", text }] };
  }

  if (name === "get_deals_near") {
    const neighborhood = String(args.neighborhood ?? "").trim();
    if (!neighborhood) throw new Error("neighborhood is required");

    // Match dispensaries by address or city substring
    const { data: dispensaries } = await supabase
      .from("dispensaries")
      .select("id, name, city, address")
      .eq("status", "active")
      .or(`city.ilike.%${neighborhood}%,address.ilike.%${neighborhood}%,name.ilike.%${neighborhood}%`);

    if (!dispensaries || dispensaries.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No dispensaries found near "${neighborhood}". Try: Strip, Henderson, North Las Vegas, Summerlin, Downtown, East Las Vegas.`,
          },
        ],
      };
    }

    const dispensaryIds = dispensaries.map((d) => d.id);

    const { data, error } = await supabase
      .from("products")
      .select("name, brand, category, weight_grams, thc_percentage, thc_mg_total, price, on_sale, deal_description, mg_per_dollar, dispensaries!inner(name, city)")
      .eq("in_stock", true)
      .in("dispensary_id", dispensaryIds)
      .not("mg_per_dollar", "is", null)
      .order("mg_per_dollar", { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);

    const rows = (data ?? []).map((p) => formatProduct(p));
    const dispensaryNames = dispensaries.map((d) => d.name).join(", ");
    const text =
      rows.length === 0
        ? `No deals found near "${neighborhood}".`
        : `Top ${rows.length} deals near "${neighborhood}" (${dispensaryNames}):\n\n${rows.join("\n\n")}`;
    return { content: [{ type: "text", text }] };
  }

  throw new Error(`Unknown tool: ${name}`);
}

// ---------------------------------------------------------------------------
// Product formatter
// ---------------------------------------------------------------------------

function formatProduct(p: Record<string, unknown>): string {
  const dispensary = p.dispensaries as Record<string, string> | null;
  const mgPerDollar = p.mg_per_dollar != null ? Number(p.mg_per_dollar).toFixed(1) : null;
  const thcLine =
    p.thc_mg_total != null
      ? `${p.thc_mg_total}mg total`
      : p.thc_percentage != null
      ? `${Number(p.thc_percentage).toFixed(1)}% THC`
      : "THC: N/A";
  const weightLine = p.weight_grams != null ? ` · ${p.weight_grams}g` : "";
  const priceLine = `$${Number(p.price).toFixed(2)}`;
  const saleLine = p.on_sale ? " [ON SALE]" : "";
  const dealLine = p.deal_description ? ` — ${p.deal_description}` : "";
  const valueLine = mgPerDollar ? ` · ${mgPerDollar} mg/$` : "";
  const dispensaryLine = dispensary ? `\n  @ ${dispensary.name}${dispensary.city ? `, ${dispensary.city}` : ""}` : "";

  return `${p.brand ? `${p.brand} — ` : ""}${p.name} (${p.category}${weightLine})\n  ${thcLine} · ${priceLine}${saleLine}${valueLine}${dealLine}${dispensaryLine}`;
}

// ---------------------------------------------------------------------------
// JSON-RPC 2.0 handler
// ---------------------------------------------------------------------------

function rpcError(id: unknown, code: number, message: string) {
  return NextResponse.json({ jsonrpc: "2.0", id, error: { code, message } });
}

function rpcResult(id: unknown, result: unknown) {
  return NextResponse.json({ jsonrpc: "2.0", id, result });
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return rpcError(null, -32700, "Parse error");
  }

  const { jsonrpc, id, method, params } = body as {
    jsonrpc?: string;
    id?: unknown;
    method?: string;
    params?: Record<string, unknown>;
  };

  if (jsonrpc !== "2.0" || typeof method !== "string") {
    return rpcError(id ?? null, -32600, "Invalid Request");
  }

  // Notifications (no id) — ack only
  if (method.startsWith("notifications/")) {
    return new NextResponse(null, { status: 204 });
  }

  if (method === "initialize") {
    return rpcResult(id, {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      serverInfo: {
        name: "daily-weed-newspaper",
        version: "1.0.0",
        description:
          "Real-time Las Vegas cannabis price intelligence. Best deals, mg per dollar rankings, dispensary search.",
      },
    });
  }

  if (method === "tools/list") {
    return rpcResult(id, { tools: TOOLS });
  }

  if (method === "tools/call") {
    const toolName = (params as Record<string, unknown>)?.name as string;
    const toolArgs = ((params as Record<string, unknown>)?.arguments ?? {}) as Record<string, unknown>;

    if (!toolName) {
      return rpcError(id, -32602, "Invalid params: missing tool name");
    }

    // Rate limit
    const rateCheck = await checkRateLimit(req);
    if (!rateCheck.allowed) {
      return rpcResult(id, {
        content: [{ type: "text", text: ZIGGY_RATE_LIMIT_MESSAGE }],
        isError: false,
      });
    }

    // Record usage for free users
    if (!rateCheck.isPro) {
      await recordUsage(rateCheck.identifier);
    }

    try {
      const result = await executeTool(toolName, toolArgs);
      return rpcResult(id, result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return rpcResult(id, {
        content: [{ type: "text", text: `Error: ${message}` }],
        isError: true,
      });
    }
  }

  return rpcError(id, -32601, `Method not found: ${method}`);
}

// MCP over HTTP also needs GET for discovery
export async function GET() {
  return NextResponse.json({
    name: "Daily Weed Newspaper MCP",
    description:
      "Real-time Las Vegas cannabis price intelligence for AI assistants.",
    version: "1.0.0",
    endpoint: "https://www.dailyweednewspaper.com/api/mcp",
    tools: TOOLS.map((t) => ({ name: t.name, description: t.description })),
  });
}
