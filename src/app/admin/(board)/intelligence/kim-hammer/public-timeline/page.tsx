import { loadKimHammerProfileWorkbench } from "@/lib/opposition/kimHammerProfileWorkbench";
import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";

export default async function KimHammerPublicTimelinePage() {
  const data = loadKimHammerProfileWorkbench();
  return (
    <KimHammerBriefingPageShell moduleId="public-timeline">
<section className="rounded-xl border border-kelly-text/10 bg-white p-4">
        <ul className="list-inside list-disc text-xs text-kelly-muted">
          {data.publicTimeline.events.map((event) => (
            <li key={`${event.year}-${event.label}`}>
              {event.year}: {event.label} ({event.evidenceStatus}, {event.confidence})
            </li>
          ))}
        </ul>
      </section>
    </KimHammerBriefingPageShell>
  );
}

