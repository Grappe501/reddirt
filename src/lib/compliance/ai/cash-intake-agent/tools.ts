export const cashIntakeAgentTools = [
  {
    name: "Cash Slip OCR Extractor",
    purpose: "Read donor slip images and produce a human-review-required extraction.",
  },
  {
    name: "Missing Field Detector",
    purpose: "Identify missing donor, address, employer, occupation, amount, date, and ID-check fields.",
  },
  {
    name: "Cash Limit Checker",
    purpose: "Compare entered amount against configurable campaign cash policy.",
  },
  {
    name: "Duplicate Cash Detector",
    purpose: "Flag same donor/date/amount and same donor/event risks.",
  },
  {
    name: "Bill Photo Evidence Checker",
    purpose: "Optionally describe whether evidence appears to show cash; human amount controls.",
  },
  {
    name: "Donor Info Normalizer",
    purpose: "Suggest normalized names, address casing, and contact formatting.",
  },
  {
    name: "Cash Batch Reconciliation Assistant",
    purpose: "Explain batch variance and later bank-deposit matching candidates.",
  },
  {
    name: "Review Note Writer",
    purpose: "Draft human-readable review notes without approving records.",
  },
  {
    name: "Compliance Warning Explainer",
    purpose: "Explain why missing fields or over-limit warnings require review.",
  },
  {
    name: "Ledger Conversion Readiness Scorer",
    purpose: "Score readiness for reviewer attention; cannot convert or certify.",
  },
] as const;
