import type { ChannelReadinessDemo } from "@/lib/narrative-distribution/demo-admin-command-center";

type Props = { items: ChannelReadinessDemo[] };

const READINESS_STYLES: Record<ChannelReadinessDemo["readiness"], string> = {
  ready: "border-emerald-200/80 bg-emerald-50/90 text-emerald-950",
  needs_asset: "border-amber-200/80 bg-amber-50/90 text-amber-950",
  blocked_compliance: "border-rose-200/80 bg-rose-50/90 text-rose-950",
  scheduled: "border-sky-200/80 bg-sky-50/90 text-sky-950",
};

const READINESS_LABEL: Record<ChannelReadinessDemo["readiness"], string> = {
  ready: "Ready",
  needs_asset: "Needs asset",
  blocked_compliance: "Compliance hold",
  scheduled: "Scheduled",
};

export function NarrativeChannelReadinessGrid({ items }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((c) => (
        <div
          key={c.channel}
          className="rounded-card border border-kelly-text/10 bg-kelly-page/90 p-4 shadow-[var(--shadow-soft)]"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="font-heading text-sm font-bold text-kelly-text">{c.displayLabel}</p>
            <span
              className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide ${READINESS_STYLES[c.readiness]}`}
            >
              {READINESS_LABEL[c.readiness]}
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-kelly-text/65">{c.notes}</p>
          <p className="mt-2 font-mono text-[10px] text-kelly-text/40">{c.channel}</p>
        </div>
      ))}
    </div>
  );
}
