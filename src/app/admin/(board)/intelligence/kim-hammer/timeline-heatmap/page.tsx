import { loadKimHammerKh3Workbench } from "@/lib/opposition/kimHammerKh3Workbench";
import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";

export default async function KimHammerTimelineHeatmapPage() {
  const data = loadKimHammerKh3Workbench();

  return (
    <KimHammerBriefingPageShell moduleId="timeline-heatmap">
<section className="grid gap-4">
        {data.timelineHeatmap.periods.map((period) => (
          <article key={period.window} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
            <h2 className="font-semibold text-kelly-navy">{period.window}</h2>
            <p className="mt-1 text-kelly-muted">Activity: {period.activityLevel}</p>
            <p className="mt-1 text-kelly-muted">{period.notes}</p>
          </article>
        ))}
      </section>
    </KimHammerBriefingPageShell>
  );
}

