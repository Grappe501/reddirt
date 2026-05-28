import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";
import { KimHammerExportControlCenterBrowser } from "../KimHammerExportControlCenterBrowser";
import {
  getCurrentExportReadyLineage,
  loadKimHammerExportHistory,
  summarizeKimHammerExportControl,
} from "@/lib/opposition/kimHammerExportControl";

export default async function KimHammerExportControlCenterPage() {
  const history = loadKimHammerExportHistory();
  const summary = summarizeKimHammerExportControl();
  const currentLineage = getCurrentExportReadyLineage();

  return (
    <KimHammerBriefingPageShell moduleId="export-control-center">
      <KimHammerExportControlCenterBrowser
        history={history}
        summary={summary}
        currentLineage={currentLineage}
      />
    </KimHammerBriefingPageShell>
  );
}
