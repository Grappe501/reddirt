import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";
import { KimHammerAuditLogBrowser } from "../KimHammerAuditLogBrowser";
import { loadKimHammerUnifiedAuditTimeline } from "@/lib/opposition/kimHammerAuditBrowser";

export default async function KimHammerAuditLogPage() {
  const timeline = loadKimHammerUnifiedAuditTimeline();

  return (
    <KimHammerBriefingPageShell moduleId="audit-log">
      <KimHammerAuditLogBrowser timeline={timeline} />
    </KimHammerBriefingPageShell>
  );
}
