import { ComplianceNav, CompliancePageHeader, StorageModeNotice } from "../../components";
import { buildAprilCheckSosWorkbook, getApril26ChecksStatus } from "@/lib/compliance/checks/april-check-sos-workbook";
import { SosCheckEntryShell } from "./sos-check-entry-shell";

export const dynamic = "force-dynamic";

export default async function SosCheckEntryPage() {
  const [workbook, status] = await Promise.all([buildAprilCheckSosWorkbook(), getApril26ChecksStatus()]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 pb-12">
      <CompliancePageHeader
        eyebrow="SOS individual entry"
        title="April check copy board"
        description="One check at a time: extract from image, verify, then copy each field into Arkansas SOS. Not a bulk upload — individual entries only."
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
      <SosCheckEntryShell
        initialWorkbook={workbook}
        april26Dir={status.april26Dir}
        folderExists={status.folderExists}
        checkImageCount={status.checkImageCount}
      />
    </div>
  );
}
