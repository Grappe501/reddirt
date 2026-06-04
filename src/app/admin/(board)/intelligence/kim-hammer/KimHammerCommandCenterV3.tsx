import Link from "next/link";
import { loadDebateIntelligenceV4HubPacket } from "@/lib/intelligence/v4/debateIntelligenceV4";
import { getSurfaceGuide } from "@/lib/intelligence/v4/debateOperatorNarratives";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { V4ThemeMatrix } from "@/components/admin/intelligence/v4/V4ThemeMatrix";
import { V4ArgumentMap } from "@/components/admin/intelligence/v4/V4ArgumentMap";
import { V3MarkdownSectionList } from "@/components/admin/intelligence/v3/V3SectionStack";

export default function KimHammerCommandCenterV3() {
  const v4 = loadDebateIntelligenceV4HubPacket();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Opponent record · v4"
        title="Kim Hammer intelligence map"
        description="Staff navigation map — Kelly should stay on hub → debate prep → bill drill-downs on debate night. Use modules for county op-eds, gap-driven retrieval, and 2021 package depth; pre-brief Kelly on at most 2–3 modules if moderator may go policy-heavy."
        guide={getSurfaceGuide("opponentRecord")}
      >
        <V4BackLinks />
      </V4PageHeader>

      <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Bills</p>
          <p className="font-heading text-2xl font-bold">{v4.hub.totalBills}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Timeline</p>
          <p className="font-heading text-2xl font-bold">{v4.timeline.length}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Themes</p>
          <p className="font-heading text-2xl font-bold">{v4.themeMatrix.length}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Claims to verify</p>
          <p className="font-heading text-2xl font-bold text-amber-800">{v4.hub.claims.needsResearch.length}</p>
        </div>
      </section>

      {v4.integrity2021 ? (
        <section className="mb-6 rounded-xl border border-violet-200/50 bg-violet-50/40 p-4">
          <h2 className="text-sm font-bold uppercase text-violet-950">2021 integrity foundation</h2>
          <p className="mt-2 text-xs text-violet-950">{v4.integrity2021.plainEnglishSummary}</p>
          <p className="mt-2 text-[10px] font-bold text-violet-900">{v4.integrity2021.billNumbers.join(" · ")}</p>
        </section>
      ) : null}

      <section className="mb-6">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Research modules</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {v4.opponentModules.map((mod) => (
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

      <section className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase text-kelly-navy">Theme matrix</h2>
          <div className="mt-3">
            <V4ThemeMatrix rows={v4.themeMatrix} />
          </div>
        </div>
        <div className="rounded-xl border border-kelly-text/10 bg-white p-4">
          <h2 className="text-sm font-bold uppercase text-kelly-navy">Argument map</h2>
          <div className="mt-3">
            <V4ArgumentMap arguments={v4.likelyArguments.slice(0, 4)} rebuttals={v4.rebuttalPlaybook} />
          </div>
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-kelly-text/10 bg-white p-4">
        <h2 className="text-sm font-bold uppercase text-kelly-navy">Public dossier excerpt</h2>
        <div className="mt-3">
          <V3MarkdownSectionList sections={v4.researchLayers.publicDossier.slice(0, 4)} />
        </div>
      </section>

      <section className="mb-6 rounded-xl border border-amber-200/50 bg-amber-50/40 p-4">
        <h2 className="text-sm font-bold uppercase text-amber-950">Intelligence gaps (KH-3B)</h2>
        <ul className="mt-2 list-inside list-disc text-xs text-amber-950">
          {v4.intelligenceGaps.map((gap) => (
            <li key={gap.id}>
              [{gap.priority}] {gap.description} — {gap.externalMessageReadiness}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
        <h2 className="text-sm font-bold uppercase text-slate-800">Staff retrieval queue</h2>
        <ul className="mt-2 list-inside list-disc text-xs text-slate-700">
          {v4.retrievalQueue.map((task) => (
            <li key={task.id}>
              {task.description} ({task.taskStatus})
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
