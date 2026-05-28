import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";
import { KimHammerNarrativeStateDashboard } from "../KimHammerNarrativeStateDashboard";
import { loadKimHammerNarrativeStateIndex } from "@/lib/opposition/kimHammerNarrativeState";

export default async function KimHammerNarrativeStatePage() {
  const index = loadKimHammerNarrativeStateIndex();

  return (
    <KimHammerBriefingPageShell moduleId="narrative-state">
      <KimHammerNarrativeStateDashboard index={index} />
    </KimHammerBriefingPageShell>
  );
}
