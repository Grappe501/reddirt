import { KimHammerNarrativeCategoryAttackPanel } from "@/components/admin/intelligence/kim-hammer/KimHammerNarrativeCategoryAttackPanel";
import { loadKimHammerKh3Workbench } from "@/lib/opposition/kimHammerKh3Workbench";
import { loadKimHammerNarrativeTestingByCategory } from "@/lib/opposition/kimHammerNarrativeTestingByCategory";
import { KimHammerBriefingPageShell } from "../KimHammerBriefingPageShell";

export default async function KimHammerNarrativeTestingPage() {
  const data = loadKimHammerKh3Workbench();
  const billCategories = loadKimHammerNarrativeTestingByCategory();

  return (
    <KimHammerBriefingPageShell moduleId="narrative-testing">
      <KimHammerNarrativeCategoryAttackPanel categories={billCategories} />

      <section className="mt-10 space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">
          Cross-cutting narrative frames
        </h2>
        <p className="max-w-3xl text-xs text-kelly-muted">
          Meta-frames that span multiple bill categories — test these after picking a category anchor
          and verified bill numbers from the sections above.
        </p>
        <div className="grid gap-4">
          {data.narrativeTesting.frames.map((frame) => (
            <article key={frame.id} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-xs">
              <h3 className="font-semibold text-kelly-navy">{frame.label}</h3>
              {frame.strongestEvidence.length > 0 ? (
                <ul className="mt-2 list-inside list-disc space-y-0.5 text-kelly-muted">
                  {frame.strongestEvidence.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {frame.weakPoints.length > 0 ? (
                <p className="mt-2 text-kelly-muted">
                  <strong>Weak points:</strong> {frame.weakPoints.join(" · ")}
                </p>
              ) : null}
              <p className="mt-2 text-kelly-muted">
                <strong>Likely rebuttal:</strong> {frame.likelyRebuttal}
              </p>
              <p className="mt-1 text-kelly-muted">
                <strong>Defensive counter:</strong> {frame.defensiveCounter}
              </p>
            </article>
          ))}
        </div>
      </section>
    </KimHammerBriefingPageShell>
  );
}
