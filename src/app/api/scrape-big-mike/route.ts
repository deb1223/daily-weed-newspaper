import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

export const maxDuration = 10; // just spawns the process, returns immediately

function isAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get("authorization") ?? "";
  const secret = req.nextUrl.searchParams.get("secret") ?? "";
  return (
    auth === `Bearer ${process.env.CRON_SECRET}` ||
    secret === process.env.CRON_SECRET
  );
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const scriptPath = path.join(process.cwd(), "scripts", "scrape-big-mike.ts");

  const proc = spawn("npx", ["tsx", scriptPath], {
    env: { ...process.env },
    detached: true,
    stdio: "ignore",
  });
  proc.unref();

  return NextResponse.json({ status: "Big Mike is on the case" });
}
