import { loadKimHammerProfileWorkbench } from "@/lib/opposition/kimHammerProfileWorkbench";
import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";

export default async function KimHammerPublicControversiesPage() {
  const data = loadKimHammerProfileWorkbench();
  return (
    <KimHammerBriefingPageShell moduleId="public-controversies">
<section className="rounded-xl border border-kelly-text/10 bg-white p-4">
        <ul className="list-inside list-disc text-xs text-kelly-muted">
          {data.publicControversies.items.map((item) => (
            <li key={item.id}>
              {item.title} - {item.evidenceStatus} ({item.confidence})
            </li>
          ))}
        </ul>
      </section>
    </KimHammerBriefingPageShell>
  );
}

