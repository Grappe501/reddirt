/**
 * Phase 15 P6 — Purchase demo mode env (client-safe).
 * Set NEXT_PUBLIC_INTELLIGENCE_DEMO_MODE=true on Netlify preview builds for buyer walkthroughs.
 */

export const INTELLIGENCE_DEMO_MODE_ENV = "NEXT_PUBLIC_INTELLIGENCE_DEMO_MODE";

export function isIntelligenceDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_INTELLIGENCE_DEMO_MODE === "true";
}

export const DEMO_MODE_DEPLOY_HINT =
  "Set NEXT_PUBLIC_INTELLIGENCE_DEMO_MODE=true with NEXT_PUBLIC_INTELLIGENCE_NAV_PROFILE=CANDIDATE for purchase demos.";
