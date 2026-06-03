import { IntelligenceLaunchModePage } from "@/components/admin/intelligence/IntelligenceLaunchModePage";
import { isIntelligenceOppositionDebateLaunchMode } from "@/lib/intelligence/intelligenceLaunchMode";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 26;

/** Launch hub — static links only; heavy hub loads via dynamic import when launch mode is off. */
export default async function OppositionIntelligenceAdminPage() {
  if (isIntelligenceOppositionDebateLaunchMode()) {
    return <IntelligenceLaunchModePage />;
  }
  const { default: Full } = await import("./OppositionIntelligenceAdminPageFull");
  return <Full />;
}
