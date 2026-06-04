import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 26;

type Props = { params: Promise<{ billNumber: string }> };

/** v5 act-proof drill-down — Arkleg links, education tiers, response rounds. */
export default async function BillActProofPage({ params }: Props) {
  const { billNumber } = await params;
  const {
    loadDebateIntelligenceV4Packet,
    findV4BillNarrative,
    isInIntegrity2021,
  } = await import("@/lib/intelligence/v4/debateIntelligenceV4");
  const { buildBillActProofDeep } = await import("@/lib/intelligence/v4/billActProofDepth");
  const { BillActProofDeepPage } = await import("../BillActProofDeepPage");

  const v4 = loadDebateIntelligenceV4Packet();
  const narrative = findV4BillNarrative(v4, billNumber);
  if (!narrative) notFound();

  const in2021 = isInIntegrity2021(v4, billNumber);
  const themeHits = v4.themeMatrix.filter((t) => t.bills.some((b) => b.toUpperCase() === billNumber.toUpperCase()));
  const deep = buildBillActProofDeep(narrative, {
    inIntegrity2021: in2021,
    themeLabels: themeHits.map((t) => t.label),
  });

  return <BillActProofDeepPage deep={deep} />;
}
