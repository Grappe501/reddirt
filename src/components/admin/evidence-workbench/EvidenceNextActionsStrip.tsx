import Link from "next/link";
import type { EvidenceNextAction } from "@/lib/campaign-media/evidence-next-actions";

type Props = {
  actions: EvidenceNextAction[];
  generatedAt: string;
};

/** Deterministic Next Actions — premium backlog strip. */
export function EvidenceNextActionsStrip({ actions, generatedAt }: Props) {
  return (
    <div className="ew-panel mt-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="ew-eyebrow !text-kelly-navy/60">Operator focus</p>
          <p className="ew-panel-title mt-1">Next actions</p>
        </div>
        <p className="font-body text-[10px] text-kelly-slate">
          {new Date(generatedAt).toLocaleString()} · Prefer Unknown
        </p>
      </div>
      <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((a, i) => (
          <li
            key={a.id}
            className="flex flex-col rounded-xl border border-kelly-border bg-gradient-to-b from-white to-kelly-fog/50 px-4 py-3 shadow-[var(--shadow-soft)]"
          >
            <p className="font-heading text-sm font-bold text-kelly-navy">
              <span className="mr-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-kelly-navy text-[11px] font-bold text-white">
                {i + 1}
              </span>
              {a.title}
            </p>
            <p className="mt-2 flex-1 font-body text-xs leading-relaxed text-kelly-slate">{a.why}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Link href={a.href} className="os-link text-xs">
                Open →
              </Link>
              {a.modeHint ? <span className="ew-chip !py-0.5">mode:{a.modeHint}</span> : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
