export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 26;

type Props = { params: Promise<{ billNumber: string }> };

/** v4 bill drill-down — narrative JSON only (no KH2/civic graph). Office-stacking contrasts are framed as: This raises a research question (verify before public use). */
export default async function KimHammerBillDetailPage({ params }: Props) {
  const { billNumber } = await params;
  const { default: BillDetailV3Page } = await import("./BillDetailV3Page");
  return <BillDetailV3Page billNumber={billNumber} />;
}
