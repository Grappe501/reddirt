import Link from "next/link";
import { Fragment } from "react";

import {
  epHammerBillHref,
  epLegislativeIntel2021Href,
} from "@/lib/election-plan/debate-prep-links";

const DEEP_LINK_RE = /\b((?:SB|HB)\d{3,4})\b|\bAct\s+(\d{3,4})\b/gi;

type Props = {
  text: string;
  className?: string;
};

/**
 * Inline drill-down links for bill numbers and act references in debate prep copy.
 * Optional rabbit holes — dashed underline signals "dig deeper here."
 */
export function DebateDeepLinkText({ text, className }: Props) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  let key = 0;

  for (const match of text.matchAll(DEEP_LINK_RE)) {
    const index = match.index ?? 0;
    if (index > last) {
      parts.push(<Fragment key={key++}>{text.slice(last, index)}</Fragment>);
    }

    const bill = match[1];
    if (bill) {
      parts.push(
        <Link
          key={key++}
          href={epHammerBillHref(bill)}
          className="font-semibold text-[var(--ep-navy)] underline decoration-dashed decoration-[var(--ep-gold)] underline-offset-2 hover:text-[var(--ep-gold)]"
          title={`Optional drill-down: ${bill} walkthrough`}
        >
          {bill}
        </Link>,
      );
    } else {
      const actLabel = match[0];
      parts.push(
        <Link
          key={key++}
          href={epLegislativeIntel2021Href()}
          className="font-semibold text-[var(--ep-navy)] underline decoration-dashed decoration-[var(--ep-gold)] underline-offset-2 hover:text-[var(--ep-gold)]"
          title="Optional drill-down: 2021 integrity package"
        >
          {actLabel}
        </Link>,
      );
    }

    last = index + match[0].length;
  }

  if (last < text.length) {
    parts.push(<Fragment key={key++}>{text.slice(last)}</Fragment>);
  }

  if (parts.length === 0) {
    return <span className={className}>{text}</span>;
  }

  return <span className={className}>{parts}</span>;
}

/** Standalone bill chip for related-bills strips. */
export function HammerBillDrillDownChip({ billNumber }: { billNumber: string }) {
  return (
    <Link
      href={epHammerBillHref(billNumber)}
      className="rounded-full border border-[var(--ep-gold)]/60 bg-[var(--ep-cream)] px-3 py-1 text-xs font-bold text-[var(--ep-navy)] hover:bg-[var(--ep-gold)]/15"
    >
      {billNumber} → walkthrough
    </Link>
  );
}
