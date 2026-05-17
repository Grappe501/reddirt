import type { ReceiptTipStatus } from "../../receipts/receipt-types";

export function detectTipStatus(input: { tip?: number; subtotal?: number; tax?: number; total?: number }): {
  tipStatus: ReceiptTipStatus;
  warnings: string[];
} {
  if ((input.tip ?? 0) > 0) return { tipStatus: "tip_on_receipt", warnings: [] };
  const expected = (input.subtotal ?? 0) + (input.tax ?? 0);
  if (input.total && expected > 0 && Math.abs(input.total - expected) > 0.05) {
    return {
      tipStatus: "not_sure",
      warnings: ["Receipt total differs from subtotal plus tax. Ask whether a tip or adjustment was added."],
    };
  }
  return { tipStatus: "no_tip", warnings: [] };
}
