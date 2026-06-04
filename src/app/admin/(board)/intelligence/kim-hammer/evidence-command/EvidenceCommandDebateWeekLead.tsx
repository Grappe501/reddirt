import Link from "next/link";
import { V4OperatorGuide } from "@/components/admin/intelligence/v4/V4OperatorGuide";
import { getSurfaceGuide } from "@/lib/intelligence/v4/debateOperatorNarratives";

const DEBATE_WEEK_LINKS = [
  { href: "/admin/intelligence/claims", label: "Claims review (Kelly firewall)" },
  { href: "/admin/intelligence/action-queue", label: "Action queue" },
  { href: "/admin/intelligence/llm-review-queue", label: "LLM review queue" },
  { href: "/admin/intelligence/kim-hammer/citation-locker", label: "Citation locker" },
  { href: "/admin/intelligence/sos-debate-questions", label: "Expected SOS questions" },
  { href: "/admin/intelligence/trap-lanes", label: "Trap lanes" },
] as const;

type EvidenceCommandDebateWeekLeadProps = {
  exportReadyCount: number;
  reviewNeededCount: number;
  blockedCount: number;
};

/**
 * Debate-week orientation — staff citation/export discipline; Kelly uses claims, not this live.
 */
export function EvidenceCommandDebateWeekLead({
  exportReadyCount,
  reviewNeededCount,
  blockedCount,
}: EvidenceCommandDebateWeekLeadProps) {
  const guide = getSurfaceGuide("evidenceCommand");

  return (
    <section className="mb-6 space-y-4">
      <article className="rounded-xl border-2 border-amber-200 bg-amber-50/60 p-5 text-sm text-amber-950">
        <p className="text-[10px] font-bold uppercase tracking-wider">What this page is for</p>
        <p className="mt-2 leading-relaxed">
          <strong>Evidence command</strong> is the staff operations desk for citation discipline: which opposition claims
          pass export gates for debate prep, press, and paid media. Kelly should verify lines in{" "}
          <Link href="/admin/intelligence/claims" className="font-bold text-kelly-navy underline">
            Claims
          </Link>{" "}
          — headset staff use this page to confirm act numbers and tiers before anything goes on stage.
        </p>
        <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-amber-900">
          INTERNAL · NON_PUBLISHABLE until review status clears
        </p>
      </article>

      {guide ? <V4OperatorGuide guide={guide} /> : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-xs">
          <p className="font-bold uppercase text-emerald-900">Export-ready now</p>
          <p className="mt-1 font-heading text-3xl font-bold text-emerald-800">{exportReadyCount}</p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs">
          <p className="font-bold uppercase text-amber-900">Needs review</p>
          <p className="mt-1 font-heading text-3xl font-bold text-amber-800">{reviewNeededCount}</p>
        </div>
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-xs">
          <p className="font-bold uppercase text-rose-900">Blocked</p>
          <p className="mt-1 font-heading text-3xl font-bold text-rose-800">{blockedCount}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        {DEBATE_WEEK_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full border border-kelly-navy/25 bg-white px-3 py-1.5 font-bold text-kelly-navy hover:bg-kelly-page"
          >
            {link.label} →
          </Link>
        ))}
      </div>
    </section>
  );
}
