import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";
import { KimHammerCitationLockerBrowser } from "../KimHammerCitationLockerBrowser";
import { MediaDerivedCitationCandidatesPanel } from "../MediaDerivedCitationCandidatesPanel";
import {
  loadKimHammerCitationLocker,
  narrativeHealthSignals,
  summarizeKimHammerCitationLocker,
} from "@/lib/opposition/kimHammerCitationLocker";
import { loadMediaDerivedCitationCandidates } from "@/lib/intelligence/mediaFindingPromotionWorkflow";

const NARRATIVE_PREVIEW_IDS = [
  "kh0b-2021-integrity-foundation",
  "SB486",
  "SB487",
];

export default async function KimHammerCitationLockerPage() {
  const locker = loadKimHammerCitationLocker();
  const summary = summarizeKimHammerCitationLocker();
  const narrativeSignals = NARRATIVE_PREVIEW_IDS.map((narrativeId) =>
    narrativeHealthSignals(narrativeId),
  ).filter((row) => row.linkedCitationCount > 0);
  const mediaCandidates = loadMediaDerivedCitationCandidates();

  return (
    <KimHammerBriefingPageShell moduleId="citation-locker">
      <MediaDerivedCitationCandidatesPanel candidates={mediaCandidates.candidates} />
      <KimHammerCitationLockerBrowser
        locker={locker}
        summary={summary}
        narrativeSignals={narrativeSignals}
      />
    </KimHammerBriefingPageShell>
  );
}
