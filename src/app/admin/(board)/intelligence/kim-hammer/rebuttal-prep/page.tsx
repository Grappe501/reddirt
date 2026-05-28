import { loadKimHammerKh2Workbench } from "@/lib/opposition/kimHammerKh2Workbench";
import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";

export default async function KimHammerRebuttalPrepPage() {
  const data = loadKimHammerKh2Workbench();

  return (
    <KimHammerBriefingPageShell moduleId="rebuttal-prep">
<section className="grid gap-4">
        {data.rebuttalPrep.rebuttals.map((item) => (
          <div key={item.prompt} className="rounded-xl border border-kelly-text/10 bg-white p-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">{item.prompt}</h2>
            <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
              <li>Agree where valid: {item.agreeWhereValid}</li>
              <li>Contrast method: {item.contrastMethod}</li>
              <li>Bridge line: {item.kellyBridge}</li>
              <li>Source category: {item.sourceCategory}</li>
              <li>Evidence status: {item.evidenceStatus}</li>
            </ul>
          </div>
        ))}
      </section>
    </KimHammerBriefingPageShell>
  );
}

