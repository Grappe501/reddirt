import type { ReceiptPaymentMethod } from "../../receipts/receipt-types";

export function detectPaymentMethod(text: string | undefined): ReceiptPaymentMethod {
  const value = (text ?? "").toLowerCase();
  if (/visa|mastercard|amex|discover|card|debit/.test(value)) return "campaign_card";
  if (/check|cheque/.test(value)) return "campaign_check";
  if (/cash/.test(value)) return "cash";
  if (/reimburse|personal/.test(value)) return "personal_reimbursement";
  return "unknown";
}
