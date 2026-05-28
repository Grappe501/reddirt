import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";
import { KimHammerGeographicNarrativeDashboard } from "../KimHammerGeographicNarrativeDashboard";
import { loadGeographicNarrativeIndex } from "@/lib/opposition/kimHammerGeographicNarrativeState";

export default async function KimHammerGeographicNarrativeIntelligencePage() {
  const index = loadGeographicNarrativeIndex();

  return (
    <KimHammerBriefingPageShell moduleId="geographic-narrative-intelligence">
      <KimHammerGeographicNarrativeDashboard index={index} />
    </KimHammerBriefingPageShell>
  );
}
