/**
 * Auth utilities — isPro and friends.
 * Keep this pure (no React, no Supabase imports) so it's usable everywhere.
 *
 * Session duration: set JWT expiry to 15552000 seconds (180 days) in
 * Supabase Dashboard → Authentication → Configuration → JWT expiry.
 *
 * OTP mode: in Supabase Dashboard → Authentication → Providers → Email,
 * enable "Email OTP" and disable "Confirm email" magic link if you want
 * 6-digit codes only (no clickable link).
 */

export type Tier = "free" | "pro" | null;

/**
 * Returns true if the user has an active Pro subscription.
 * Pass the tier returned from useUser().
 */
export function isPro(tier: Tier): boolean {
  return tier === "pro";
}
