import { loadKimHammerKh3Workbench } from "@/lib/opposition/kimHammerKh3Workbench";
import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";

export default async function KimHammerModernSosContrastPage() {
  const data = loadKimHammerKh3Workbench();

  return (
    <KimHammerBriefingPageShell moduleId="modern-sos-contrast">
<section className="grid gap-4">
        {data.modernSosContrast.contrastRows.map((row) => (
          <article key={`${row.hammerLane}-${row.kellyLane}`} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
            <p className="font-semibold text-kelly-navy">Hammer: {row.hammerLane}</p>
            <p className="mt-1 text-kelly-muted">Kelly: {row.kellyLane}</p>
            <p className="mt-1 text-kelly-muted">Use case: {row.useCase.join(", ")}</p>
          </article>
        ))}
      </section>
    </KimHammerBriefingPageShell>
  );
}

