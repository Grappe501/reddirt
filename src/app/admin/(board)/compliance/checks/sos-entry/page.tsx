import { ComplianceNav, CompliancePageHeader, StorageModeNotice } from "../../components";
import { buildAprilCheckSosWorkbook } from "@/lib/compliance/checks/april-check-sos-workbook";
import { SosCheckEntryClient } from "./sos-check-entry-client";

export const dynamic = "force-dynamic";

export default async function SosCheckEntryPage() {
  const workbook = await buildAprilCheckSosWorkbook();

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
        field you have not verified on the physical check. Empty fields mean “get from source,” not “guess.”
      </div>
      <SosCheckEntryClient initialWorkbook={workbook} />
    </div>
  );
}
