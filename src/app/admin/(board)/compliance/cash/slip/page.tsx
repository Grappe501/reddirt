import { ComplianceNav, CompliancePageHeader } from "../../components";

export default function CashDonorSlipPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <CompliancePageHeader
        eyebrow="Printable slip"
        title="Cash Donor Information Slip"
        description="Print this page for events. Staff can photograph the completed slip during cash intake."
      />
      <ComplianceNav />
      <section className="rounded-2xl border-2 border-kelly-text bg-white p-8 text-kelly-text print:border-black print:shadow-none">
        <h1 className="font-heading text-2xl font-bold">Cash Contribution Donor Slip</h1>
        <p className="mt-2 font-body text-sm">Kelly Grappe for Secretary of State — staff use only for compliance intake.</p>
        <div className="mt-6 grid gap-5">
          {[
            "Full name",
            "Mailing address",
            "City / State / ZIP",
            "Phone",
            "Email",
            "Employer",
            "Occupation",
            "Amount",
            "Date",
            "Signature optional",
            "Staff initials",
            "Event/source",
          ].map((label) => (
            <div key={label} className="border-b border-kelly-text pb-2 font-body text-sm">
              <span className="font-bold">{label}:</span>
            </div>
          ))}
        </div>
        <p className="mt-6 font-body text-xs">
          Campaign policy: cash contributions require contributor information and human compliance review. Final rules must be verified with campaign counsel/compliance officer.
        </p>
      </section>
    </div>
  );
}
