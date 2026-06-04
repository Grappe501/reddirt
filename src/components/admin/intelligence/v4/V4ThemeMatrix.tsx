import Link from "next/link";
import type { V4ThemeRow } from "@/lib/intelligence/v4/debateIntelligenceV4Types";
import { getSurfaceGuide } from "@/lib/intelligence/v4/debateOperatorNarratives";
import { V4OperatorGuide } from "@/components/admin/intelligence/v4/V4OperatorGuide";

export function V4ThemeMatrix({ rows }: { rows: V4ThemeRow[] }) {
  const guide = getSurfaceGuide("themeMatrix");
  if (rows.length === 0) return <p className="text-xs text-kelly-muted">Theme matrix not loaded.</p>;
  return (
    <div>
      {guide ? <V4OperatorGuide guide={guide} /> : null}
      <div className="mt-4 space-y-2">
      {rows.slice(0, 12).map((row) => (
        <div key={row.theme} className="rounded-lg border border-kelly-text/10 bg-white p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-bold uppercase text-kelly-navy">{row.label}</p>
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-900">
              {row.billCount} bills
            </span>
          </div>
          <p className="mt-2 flex flex-wrap gap-1 text-[10px]">
            {row.bills.map((bill) => (
              <Link
                key={bill}
                href={`/admin/intelligence/kim-hammer/bills/${encodeURIComponent(bill)}`}
                className="rounded border border-kelly-navy/20 px-1.5 py-0.5 font-bold text-kelly-navy hover:bg-kelly-page"
              >
                {bill}
              </Link>
            ))}
          </p>
        </div>
      ))}
      </div>
    </div>
  );
}
