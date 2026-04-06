import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

// Fire-and-forget scraper trigger.
// Works when the Next.js app and scraper share a filesystem (local / VPS).
// On Vercel serverless the spawn will silently no-op — run the scraper via
// a cron on the host machine instead.
export const maxDuration = 10;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scraperPath =
    process.env.SCRAPER_PATH ??
    path.resolve(process.cwd(), "scripts/scrape-dispensaries.ts");

  try {
    const child = spawn("npx", ["tsx", scraperPath], {
      detached: true,
      stdio: "ignore",
      env: { ...process.env },
    });
    child.unref();
  } catch {
    // spawn failure (e.g. on Vercel) — acknowledge without error
  }

  return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
}
