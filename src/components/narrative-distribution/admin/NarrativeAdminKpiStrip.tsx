import type { NarrativeAdminKpi } from "@/lib/narrative-distribution/demo-admin-command-center";

type Props = { items: NarrativeAdminKpi[] };

export function NarrativeAdminKpiStrip({ items }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((k) => (
        <div
          key={k.label}
          className="rounded-card border border-kelly-text/10 bg-kelly-page/90 p-4 shadow-[var(--shadow-soft)]"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-kelly-text/45">{k.label}</p>
          <p className="font-heading mt-2 text-2xl font-bold text-kelly-navy">{k.value}</p>
          <p className="mt-1 text-xs text-kelly-text/55">{k.hint}</p>
        </div>
      ))}
    </div>
  );
}
