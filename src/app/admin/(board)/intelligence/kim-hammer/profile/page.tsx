import { loadKimHammerProfileWorkbench } from "@/lib/opposition/kimHammerProfileWorkbench";
import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";

export default async function KimHammerProfilePage() {
  const data = loadKimHammerProfileWorkbench();
  return (
    <KimHammerBriefingPageShell moduleId="profile">
<section className="rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Public Biography Summary</h2>
        <ul className="mt-2 list-inside list-disc text-xs text-kelly-muted">
          {data.profileHighlights.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </section>
    </KimHammerBriefingPageShell>
  );
}

