import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  // ── Lucky 7 session seed ──────────────────────────────────────────────────
  // Mutate request cookies BEFORE NextResponse.next({ request }) so that
  // server components can read dwn_session via cookies() on this same request.
  let sessionSeed = request.cookies.get("dwn_session")?.value;
  let isNewSeed = false;
  if (!sessionSeed) {
    const bytes = crypto.getRandomValues(new Uint8Array(8));
    sessionSeed = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    request.cookies.set("dwn_session", sessionSeed);
    isNewSeed = true;
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — must await, do not remove.
  await supabase.auth.getUser();

  // Persist the new seed on the response so the browser stores it for future visits.
  if (isNewSeed && sessionSeed) {
    supabaseResponse.cookies.set("dwn_session", sessionSeed, {
      httpOnly: false,
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
      sameSite: "lax",
    });
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
