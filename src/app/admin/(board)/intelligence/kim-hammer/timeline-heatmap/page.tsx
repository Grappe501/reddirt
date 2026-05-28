import { loadKimHammerKh3Workbench } from "@/lib/opposition/kimHammerKh3Workbench";

export default async function KimHammerTimelineHeatmapPage() {
  const data = loadKimHammerKh3Workbench();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <header className="mb-6 border-b border-kelly-text/10 pb-4">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">KH-3 Timeline Heatmap</p>
        <h1 className="font-heading text-2xl font-bold">Legislative Timeline Heatmap</h1>
      </header>
      <section className="grid gap-4">
        {data.timelineHeatmap.periods.map((period) => (
          <article key={period.window} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
            <h2 className="font-semibold text-kelly-navy">{period.window}</h2>
            <p className="mt-1 text-kelly-muted">Activity: {period.activityLevel}</p>
            <p className="mt-1 text-kelly-muted">{period.notes}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

