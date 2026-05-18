import { redirect } from "next/navigation";
import { ComplianceNav, CompliancePageHeader, StorageModeNotice } from "../../components";
import { extractReceiptWithOpenAI } from "@/lib/compliance/ai/receipt-intake-agent/extract-receipt-with-openai";
import { detectTipStatus } from "@/lib/compliance/ai/receipt-intake-agent/tip-detector";
import { createStagedReceipt, saveReceiptUpload } from "@/lib/compliance/receipts/receipt-storage";
import type { ReceiptExpenseCategory, ReceiptPaymentMethod, ReceiptTipStatus } from "@/lib/compliance/receipts/receipt-types";

export const dynamic = "force-dynamic";

async function createReceiptAction(formData: FormData) {
  "use server";
  const initials = String(formData.get("createdByInitials") ?? "");
  const file = formData.get("receiptFile");
  const manualText = String(formData.get("manualText") ?? "");
  let upload: Awaited<ReturnType<typeof saveReceiptUpload>> | undefined;
  let extraction = await extractReceiptWithOpenAI({ manualText });
  if (file instanceof File && file.size > 0) {
    const buffer = await file.arrayBuffer();
    upload = await saveReceiptUpload({ fileName: file.name, arrayBuffer: buffer });
    const imageBase64 = Buffer.from(buffer).toString("base64");
    extraction = await extractReceiptWithOpenAI({ imageBase64, mimeType: file.type || "image/jpeg", manualText });
  }
  const tipStatus = String(formData.get("tipStatus") ?? "not_sure") as ReceiptTipStatus;
  const tipAmount = Number(formData.get("tipAmount") ?? 0);
  const total = Number(formData.get("total") ?? extraction.total ?? 0);
  const tip = tipStatus === "tip_added_after" ? tipAmount : Number(formData.get("tip") ?? extraction.tip ?? 0);
  const tipDetection = detectTipStatus({ subtotal: Number(formData.get("subtotal") ?? extraction.subtotal ?? 0), tax: Number(formData.get("tax") ?? extraction.tax ?? 0), tip, total });
  const receipt = await createStagedReceipt({
    createdByInitials: initials,
    vendorName: String(formData.get("vendorName") ?? extraction.vendorName ?? ""),
    receiptDate: String(formData.get("receiptDate") ?? extraction.receiptDate ?? ""),
    subtotal: Number(formData.get("subtotal") ?? extraction.subtotal ?? 0),
    tax: Number(formData.get("tax") ?? extraction.tax ?? 0),
    tip,
    total: tipStatus === "tip_added_after" ? total + tipAmount : total,
    tipStatus: tipStatus === "not_sure" ? tipDetection.tipStatus : tipStatus,
    tipVerificationNote: String(formData.get("tipVerificationNote") ?? ""),
    paymentMethod: String(formData.get("paymentMethod") ?? extraction.paymentMethod ?? "unknown") as ReceiptPaymentMethod,
    cardLastFour: String(formData.get("cardLastFour") ?? extraction.cardLastFour ?? ""),
    checkNumber: String(formData.get("checkNumber") ?? ""),
    category: String(formData.get("category") ?? extraction.suggestedCategory ?? "unknown") as ReceiptExpenseCategory,
    businessPurpose: String(formData.get("businessPurpose") ?? extraction.suggestedPurpose ?? ""),
    imagePath: upload?.imagePath,
    imageHash: upload?.imageHash,
    sourceFileName: upload?.sourceFileName,
    extraction,
  });
  redirect(`/admin/compliance/receipts/${receipt.id}`);
}

export default function NewReceiptPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <CompliancePageHeader eyebrow="Receipt wizard" title="New Receipt Intake" description="Upload a receipt or use manual entry. AI extraction is optional and always requires human verification." />
      <ComplianceNav />
      <StorageModeNotice />
      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-wash p-4 font-body text-sm text-kelly-text/75">
        <strong>Flow:</strong> save draft receipt → review extracted fields → verify tip/payment/purpose → approve → stage expense or reimbursement → match to bank.
      </section>
      <form action={createReceiptAction} className="grid gap-5 rounded-2xl border border-kelly-text/10 bg-kelly-page p-5 font-body text-sm">
        <label className="grid gap-2 font-semibold">Step 1 - Reviewer initials<input className="rounded-xl border p-3" name="createdByInitials" minLength={2} maxLength={3} placeholder="ABC" required /></label>
        <label className="grid gap-2 font-semibold">Step 2 - Upload receipt image/PDF<input className="rounded-xl border p-3" name="receiptFile" type="file" accept="image/*,.pdf" capture="environment" /></label>
        <label className="grid gap-2 font-semibold">Manual entry / OCR fallback<textarea className="rounded-xl border p-3" name="manualText" rows={4} placeholder="Paste visible receipt text if image OCR is unavailable." /></label>
        <section className="grid gap-3 md:grid-cols-2">
          <input className="rounded-xl border p-3" name="vendorName" placeholder="Vendor / merchant" />
          <input className="rounded-xl border p-3" name="receiptDate" type="date" />
          <input className="rounded-xl border p-3" name="subtotal" type="number" step="0.01" placeholder="Subtotal" />
          <input className="rounded-xl border p-3" name="tax" type="number" step="0.01" placeholder="Tax" />
          <input className="rounded-xl border p-3" name="tip" type="number" step="0.01" placeholder="Tip shown on receipt" />
          <input className="rounded-xl border p-3" name="total" type="number" step="0.01" placeholder="Total" required />
        </section>
        <section className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-2">Was a tip added?<select className="rounded-xl border p-3" name="tipStatus"><option value="no_tip">No tip</option><option value="tip_on_receipt">Tip shown on receipt</option><option value="tip_added_after">Tip added after receipt</option><option value="not_sure">Not sure</option></select></label>
          <input className="rounded-xl border p-3" name="tipAmount" type="number" step="0.01" placeholder="Tip added after receipt amount" />
        </section>
        <textarea className="rounded-xl border p-3" name="tipVerificationNote" rows={2} placeholder="Tip verification note" />
        <section className="grid gap-3 md:grid-cols-3">
          <select className="rounded-xl border p-3" name="paymentMethod"><option value="campaign_card">Campaign debit/card</option><option value="campaign_check">Campaign check</option><option value="personal_reimbursement">Staff paid personally / reimbursement needed</option><option value="cash">Cash</option><option value="unknown">Unknown</option></select>
          <input className="rounded-xl border p-3" name="cardLastFour" placeholder="Card last four" maxLength={4} />
          <input className="rounded-xl border p-3" name="checkNumber" placeholder="Check number" />
        </section>
        <section className="grid gap-3 md:grid-cols-2">
          <select className="rounded-xl border p-3" name="category">{["meals","travel","lodging","fuel","printing","postage","event_supplies","office_supplies","software","advertising","fundraising","bank_fee","staff_payment","consulting","other","unknown"].map((category) => <option key={category} value={category}>{category}</option>)}</select>
          <input className="rounded-xl border p-3" name="businessPurpose" placeholder="Campaign business purpose" />
        </section>
        <button className="rounded-full bg-kelly-navy px-5 py-3 font-bold text-white" type="submit">Save Draft Receipt and Review</button>
      </form>
    </div>
  );
}
