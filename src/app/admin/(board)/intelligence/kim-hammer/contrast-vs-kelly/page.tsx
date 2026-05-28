import { loadKimHammerKh2Workbench } from "@/lib/opposition/kimHammerKh2Workbench";
import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";

export default async function KimHammerContrastVsKellyPage() {
  const data = loadKimHammerKh2Workbench();

  return (
    <KimHammerBriefingPageShell moduleId="contrast-vs-kelly">
<section className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs text-kelly-muted">
        <ul className="list-inside list-disc">
          {data.contrast.contrastFrames.map((frame) => (
            <li key={frame.frame}>
              <span className="font-semibold">{frame.frame.replaceAll("_", " ")}:</span> {frame.hammerPositionSummary} vs{" "}
              {frame.kellyContrast} ({frame.evidenceStatus}; {frame.sourceConfidence})
            </li>
          ))}
        </ul>
      </section>
    </KimHammerBriefingPageShell>
  );
}

