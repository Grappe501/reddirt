import { QuoteBand } from "@/components/blocks/QuoteBand";

export function HomeHomepageQuoteSection({
  quote,
  attribution,
}: {
  quote: string;
  attribution?: string;
}) {
  if (!quote.trim()) return null;
  return <QuoteBand quote={quote} attribution={attribution} variant="gold-band" id="campaign-quote" />;
}
