"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { Tier } from "@/lib/auth";

export interface UserState {
  user: User | null;
  tier: Tier;
  loading: boolean;
}

/**
 * Returns the current Supabase auth session and the subscriber's tier.
 *
 * - `loading` is true until the initial session check resolves.
 * - `tier` is null while loading, 'free' if authenticated but no subscriber
 *   record exists, or 'pro' / 'free' from the subscribers table.
 * - Reactively updates on login / logout.
 */
export function useUser(): UserState {
  const [user, setUser] = useState<User | null>(null);
  const [tier, setTier] = useState<Tier>(null);
  const [loading, setLoading] = useState(true);
  // Prevents the initial onAuthStateChange SIGNED_IN event (which fires
  // immediately on mount in parallel with getSession) from running a second
  // fetchTier and overwriting the tier resolved by getSession.
  const initialLoadDone = useRef(false);

  async function fetchTier(email: string) {
    const { data } = await supabase
      .from("subscribers")
      .select("tier")
      .eq("email", email)
      .maybeSingle();
    setTier((data?.tier as Tier) ?? "free");
  }

  useEffect(() => {
    // Single source of truth for the initial tier fetch.
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u?.email) {
        fetchTier(u.email).finally(() => {
          initialLoadDone.current = true;
          setLoading(false);
        });
      } else {
        initialLoadDone.current = true;
        setLoading(false);
      }
    });

    // Only handles mid-session auth changes (new sign-in, sign-out).
    // Skips the initial SIGNED_IN that fires on mount — getSession() owns that.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!initialLoadDone.current) return;
      const u = session?.user ?? null;
      setUser(u);
      if (u?.email) {
        fetchTier(u.email);
      } else {
        setTier(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, tier, loading };
}
