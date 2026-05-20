import { ComplianceNav, CompliancePageHeader, StorageModeNotice } from "../../components";
import { buildAprilCheckSosWorkbook, getApril26ChecksStatus } from "@/lib/compliance/checks/april-check-sos-workbook.server";
import { isOpenAIConfigured } from "@/lib/openai/client";
import { SosCheckEntryShell } from "./sos-check-entry-shell";
import { SosCheckAuditPanel } from "./sos-check-audit-panel";

export const dynamic = "force-dynamic";

export default async function SosCheckEntryPage() {
  const [workbook, status, openAiConfigured] = await Promise.all([
    buildAprilCheckSosWorkbook(),
    getApril26ChecksStatus(),
    Promise.resolve(isOpenAIConfigured()),
  ]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 pb-12">
      <CompliancePageHeader
        eyebrow="SOS individual entry"
        title="April checks — full review board"
        description="Seven photos in Checks donations — each photo may contain multiple checks. Extract per photo to list every physical check, verify, then copy into Arkansas SOS (one individual entry per check)."
      />
      <ComplianceNav />
      <StorageModeNotice />
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        <strong>Human review required.</strong> Vision may miss employer/occupation or misread handwriting. Never copy a
        field you have not verified on the physical check.
      </div>
      {!status.folderExists ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          April26 folder not found. For local dev, set{" "}
          <code className="rounded bg-white px-1">COMPLIANCE_APRIL26_DIR=H:\SOSWebsite\Compliance\April26</code> in{" "}
          <code className="rounded bg-white px-1">.env.local</code> and restart <code className="rounded bg-white px-1">npm run dev</code>.
        </div>
      ) : null}
      <SosCheckAuditPanel workbook={workbook} />
      <SosCheckEntryShell
        initialWorkbook={workbook}
        april26Dir={status.april26Dir}
        folderExists={status.folderExists}
        checkImageCount={status.checkImageCount}
        openAiConfigured={openAiConfigured}
      />
    </div>
  );
}
