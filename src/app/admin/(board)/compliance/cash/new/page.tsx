import { redirect } from "next/navigation";
import { ComplianceNav, CompliancePageHeader, StorageModeNotice } from "../../components";
import { createStagedCashContribution, saveCashUpload } from "@/lib/compliance/cash/cash-storage";
import { extractCashSlip } from "@/lib/compliance/cash/extract-cash-slip";

export const dynamic = "force-dynamic";

export default function NewCashContributionPage() {
  async function createCashContribution(formData: FormData) {
    "use server";
    const amount = Number(formData.get("amount") ?? 0);
    const extraction = await extractCashSlip({ enteredAmount: amount });
    const [billUpload, donorSlipUpload] = await Promise.all([
      saveOptionalCashEvidence(formData.get("billPhoto"), "bill"),
      saveOptionalCashEvidence(formData.get("donorSlipPhoto"), "donor-slip"),
    ]);
    await createStagedCashContribution({
      createdByInitials: String(formData.get("createdByInitials") ?? ""),
      contributionDate: String(formData.get("contributionDate") ?? "") || undefined,
      amount,
      donorFullName: String(formData.get("donorFullName") ?? ""),
      donorAddress1: String(formData.get("donorAddress1") ?? ""),
      donorCity: String(formData.get("donorCity") ?? ""),
      donorState: String(formData.get("donorState") ?? ""),
      donorZip: String(formData.get("donorZip") ?? ""),
      donorPhone: String(formData.get("donorPhone") ?? ""),
      donorEmail: String(formData.get("donorEmail") ?? ""),
      employer: String(formData.get("employer") ?? ""),
      occupation: String(formData.get("occupation") ?? ""),
      idChecked: formData.get("idChecked") === "on",
      idCheckMethod: formData.get("idChecked") === "on" ? "visual_check" : "not_recorded",
      idCheckedByInitials: String(formData.get("createdByInitials") ?? ""),
      eventSource: String(formData.get("eventSource") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      billPhotoPath: billUpload?.filePath,
      donorSlipPhotoPath: donorSlipUpload?.filePath,
      ocrExtraction: extraction,
    });
    redirect("/admin/compliance/cash/review");
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <CompliancePageHeader
        eyebrow="Cash intake"
        title="New Cash Contribution"
        description="Fast mobile-first capture. Human-entered amount controls; OCR is advisory and human review is required."
      />
      <ComplianceNav />
      <StorageModeNotice />
      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-wash p-4 font-body text-sm text-kelly-text/75">
        Evidence photos are stored under ignored local compliance uploads. The review queue decides approval, batching, and conversion.
      </section>
      <form action={createCashContribution} className="grid gap-5">
        <Step title="1. Reviewer initials">
          <Input name="createdByInitials" label="Who is entering this? Initials" required />
        </Step>
        <Step title="2. Amount">
          <Input name="amount" label="Cash amount" type="number" step="0.01" required />
          <Input name="billCount" label="Bill count optional" type="number" />
          <Input name="eventSource" label="Event/source optional" />
          <FileInput name="billPhoto" label="Take/Upload Bill Photo" />
        </Step>
        <Step title="3. Donor slip photo">
          <FileInput name="donorSlipPhoto" label="Take/Upload Slip Photo" />
          <label className="flex items-center gap-2 font-body text-sm font-semibold text-kelly-text">
            <input type="checkbox" name="idChecked" className="h-5 w-5" /> ID visually checked
          </label>
        </Step>
        <Step title="4-5. OCR extraction and human review">
          <p className="font-body text-sm text-kelly-text/75">
            If OCR is unavailable, the record is still staged for manual review and missing fields are flagged.
          </p>
          <Input name="donorFullName" label="Donor full name" />
          <Input name="donorAddress1" label="Mailing address" />
          <div className="grid gap-3 sm:grid-cols-3">
            <Input name="donorCity" label="City" />
            <Input name="donorState" label="State" />
            <Input name="donorZip" label="Zip" />
          </div>
          <Input name="donorPhone" label="Phone" />
          <Input name="donorEmail" label="Email" type="email" />
          <Input name="employer" label="Employer" />
          <Input name="occupation" label="Occupation" />
          <Input name="contributionDate" label="Date" type="date" />
          <label className="font-body text-sm font-semibold text-kelly-text">
            Notes
            <textarea name="notes" className="mt-2 min-h-24 w-full rounded-xl border border-kelly-text/20 bg-white p-3" />
          </label>
        </Step>
        <button className="rounded-2xl bg-kelly-navy px-5 py-4 font-body text-lg font-bold text-white">Stage Contribution</button>
      </form>
    </div>
  );
}

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-5 shadow-[var(--shadow-soft)]">
      <h2 className="font-heading text-xl font-bold text-kelly-text">{title}</h2>
      <div className="mt-4 grid gap-3">{children}</div>
    </section>
  );
}

function Input(props: { name: string; label: string; type?: string; step?: string; required?: boolean }) {
  return (
    <label className="font-body text-sm font-semibold text-kelly-text">
      {props.label}
      <input name={props.name} type={props.type ?? "text"} step={props.step} required={props.required} className="mt-2 block w-full rounded-xl border border-kelly-text/20 bg-white p-3 text-base" />
    </label>
  );
}

function FileInput(props: { name: string; label: string }) {
  return (
    <label className="font-body text-sm font-semibold text-kelly-text">
      {props.label}
      <input name={props.name} type="file" accept="image/*" capture="environment" className="mt-2 block w-full rounded-xl border border-kelly-text/20 bg-white p-3" />
    </label>
  );
}

async function saveOptionalCashEvidence(value: FormDataEntryValue | null, evidenceType: "bill" | "donor-slip") {
  if (!(value instanceof File) || !value.name || value.size === 0) return undefined;
  return saveCashUpload({ fileName: value.name, arrayBuffer: await value.arrayBuffer(), evidenceType });
}
