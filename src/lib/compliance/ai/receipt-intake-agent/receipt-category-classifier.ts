import type { ReceiptExpenseCategory } from "../../receipts/receipt-types";

export function classifyReceiptCategory(input: { vendorName?: string; lineText?: string; purpose?: string }): ReceiptExpenseCategory {
  const text = `${input.vendorName ?? ""} ${input.lineText ?? ""} ${input.purpose ?? ""}`.toLowerCase();
  if (/hotel|inn|lodg/.test(text)) return "lodging";
  if (/fuel|gas|shell|exxon|bp|chevron|murphy/.test(text)) return "fuel";
  if (/restaurant|cafe|coffee|diner|grill|meal|pizza|bbq/.test(text)) return "meals";
  if (/print|copy|flyer|sign|banner/.test(text)) return "printing";
  if (/postage|mail|usps|ups|fedex/.test(text)) return "postage";
  if (/facebook|meta|google ads|advertis/.test(text)) return "advertising";
  if (/software|subscription|saas|domain/.test(text)) return "software";
  if (/office|paper|staples|supplies/.test(text)) return "office_supplies";
  if (/event|table|tent|canopy|supply/.test(text)) return "event_supplies";
  if (/fundrais|processor|goodchange|stripe/.test(text)) return "fundraising";
  if (/consult|staff|contract/.test(text)) return "consulting";
  if (/travel|parking|uber|lyft|airline/.test(text)) return "travel";
  if (/bank fee|service charge/.test(text)) return "bank_fee";
  return "unknown";
}
