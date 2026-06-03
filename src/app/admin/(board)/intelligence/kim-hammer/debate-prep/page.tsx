import { isIntelligenceOppositionDebateLaunchMode } from "@/lib/intelligence/intelligenceLaunchMode";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 26;

/** Launch mode loads a separate chunk — avoids importing kimHammerModuleBriefings at cold start. */
export default async function KimHammerDebatePrepPage() {
  if (isIntelligenceOppositionDebateLaunchMode()) {
    const { default: Launch } = await import("./DebatePrepLaunchPage");
    return <Launch />;
  }
  const { default: Full } = await import("./DebatePrepFullPage");
  return <Full />;
}
