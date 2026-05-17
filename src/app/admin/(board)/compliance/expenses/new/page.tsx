import { redirect } from "next/navigation";
import { ComplianceNav, CompliancePageHeader, StorageModeNotice } from "../../components";
import { createComplianceExpense, type ComplianceExpenseCategory } from "@/lib/compliance/expenses/expense-storage";

export const dynamic = "force-dynamic";

const categories: ComplianceExpenseCategory[] = ["advertising", "printing", "postage", "event", "travel", "staff/consulting", "office", "software", "fundraising fee", "bank fee", "other"];

async function createExpenseAction(formData: FormData) {
  "use server";
  await createComplianceExpense({
    payeeName: String(formData.get("payeeName") ?? ""),
    amount: Number(formData.get("amount") ?? 0),
    date: String(formData.get("date") ?? ""),
    paymentMethod: String(formData.get("paymentMethod") ?? "unknown") as "cash" | "check" | "credit_card" | "debit_card" | "ach" | "wire" | "other" | "unknown",
    checkNumber: String(formData.get("checkNumber") ?? ""),
    category: String(formData.get("category") ?? "other") as ComplianceExpenseCategory,
    purpose: String(formData.get("purpose") ?? ""),
    staffInitials: String(formData.get("staffInitials") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  });
  redirect("/admin/compliance/money");
}

export default function NewComplianceExpensePage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <CompliancePageHeader
        eyebrow="Money out"
        title="New Expense / Payment"
        description="Stage vendor, staff, reimbursement, fee, ACH, card, debit, or check payments for documentation and bank matching."
      />
      <ComplianceNav />
      <StorageModeNotice />
      <form action={createExpenseAction} className="grid gap-4 rounded-2xl border border-kelly-text/10 bg-kelly-page p-5 font-body text-sm">
        <input className="rounded-xl border p-3" name="staffInitials" placeholder="Staff initials" required />
        <input className="rounded-xl border p-3" name="payeeName" placeholder="Payee/vendor/staff name" required />
        <div className="grid gap-3 md:grid-cols-3">
          <input className="rounded-xl border p-3" name="amount" type="number" step="0.01" placeholder="Amount" required />
          <input className="rounded-xl border p-3" name="date" type="date" />
          <select className="rounded-xl border p-3" name="paymentMethod">
            {["check", "debit_card", "credit_card", "ach", "wire", "cash", "other", "unknown"].map((method) => <option key={method}>{method}</option>)}
          </select>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <select className="rounded-xl border p-3" name="category">{categories.map((category) => <option key={category}>{category}</option>)}</select>
          <input className="rounded-xl border p-3" name="checkNumber" placeholder="Check number if check" />
        </div>
        <input className="rounded-xl border p-3" name="purpose" placeholder="Purpose" />
        <textarea className="rounded-xl border p-3" name="notes" placeholder="Receipt/invoice note, reimbursement context, bank memo" rows={4} />
        <button className="rounded-full bg-kelly-navy px-5 py-3 font-bold text-white" type="submit">Stage Expense</button>
      </form>
    </div>
  );
}
