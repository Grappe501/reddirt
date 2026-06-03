import Link from "next/link";
import { loadDebateIntelligenceV3Packet } from "@/lib/intelligence/v3/debateIntelligenceV3";
import { V3BackLinks, V3PageHeader } from "@/components/admin/intelligence/v3/V3PageHeader";
import { V3MarkdownSectionList } from "@/components/admin/intelligence/v3/V3SectionStack";

export default function KimHammerCommandCenterV3() {
  const v3 = loadDebateIntelligenceV3Packet();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V3PageHeader
        eyebrow="Opponent record · v3"
        title="Kim Hammer intelligence map"
        description="Orientation across KH-2 debate research, election-record themes, KH-3 deep dossier, and open intelligence gaps — without loading the full module briefing graph."
      >
        <V3BackLinks />
      </V3PageHeader>

      <section className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Bills</p>
          <p className="font-heading text-2xl font-bold">{v3.hub.totalBills}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Narratives</p>
          <p className="font-heading text-2xl font-bold">{v3.billNarratives.length}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Claims to verify</p>
          <p className="font-heading text-2xl font-bold text-amber-800">{v3.hub.claims.needsResearch.length}</p>
        </div>
      </section>

      <section className="mb-6">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Research modules</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {v3.opponentModules.map((mod) => (
            <Link
              key={mod.id}
              href={mod.href}
              className="rounded-xl border border-kelly-text/10 bg-white p-4 transition hover:border-kelly-navy/30"
            >
              <h3 className="font-bold text-kelly-navy">{mod.title}</h3>
              <p className="mt-2 text-xs text-kelly-muted">{mod.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase text-kelly-navy">Public dossier excerpt</h2>
        <div className="mt-3">
          <V3MarkdownSectionList sections={v3.researchLayers.publicDossier.slice(0, 4)} />
        </div>
      </section>

      <section className="rounded-xl border border-amber-200/50 bg-amber-50/40 p-4">
        <h2 className="text-sm font-bold uppercase text-amber-950">Open intelligence gaps</h2>
        <div className="mt-3">
          <V3MarkdownSectionList sections={v3.researchLayers.intelligenceGaps} />
        </div>
      </section>
    </div>
  );
}
