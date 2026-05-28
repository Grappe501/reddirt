import { KimHammerNarrativePanel } from "../KimHammerNarrativePanel";
import type { KimHammerNarrativeSection } from "@/lib/opposition/kimHammerNarrativeBriefings";

type EvidenceCommandNarrativeBriefProps = {
  sections: KimHammerNarrativeSection[];
};

export function EvidenceCommandNarrativeBrief({ sections }: EvidenceCommandNarrativeBriefProps) {
  const evidence = sections.find((s) => s.id === "evidence-governance");
  const retrieval = sections.find((s) => s.id === "retrieval-mission");
  const risk = sections.find((s) => s.id === "risk-counterattack");

  if (!evidence || !retrieval || !risk) return null;

  return (
    <section className="mb-8">
      <header className="mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-kelly-navy">Evidence desk narrative</h2>
        <p className="mt-1 max-w-3xl text-xs leading-relaxed text-kelly-muted">
          Governance story before the metrics — what the archive proves, what retrieval must unlock, and where
          counterattack risk concentrates.
        </p>
      </header>
      <div className="grid gap-4 lg:grid-cols-3">
        <KimHammerNarrativePanel section={evidence} variant="compact" />
        <KimHammerNarrativePanel section={retrieval} variant="compact" />
        <KimHammerNarrativePanel section={risk} variant="compact" />
      </div>
    </section>
  );
}
