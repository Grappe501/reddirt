import Link from "next/link";
import { V7MichaelPackoScaffoldPanel } from "@/components/admin/intelligence/v4/V7MichaelPackoScaffoldPanel";
import { V4AllCandidateDossiersHub } from "@/components/admin/intelligence/v4/V4KellyCandidateDossierPanel";
import { KimHammerModuleNavPanel } from "@/components/admin/intelligence/KimHammerModuleNavPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";

export default function OpponentsHubPage() {
  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Kelly · multi-candidate opposition"
        title="Opponents hub"
        description="Kelly alignment profile plus complete dossiers for Kim Hammer and Dr. Michael Pakko — strengths, weaknesses, claims, lead stories. Hammer command center for bills and timeline."
      >
        <V4BackLinks />
        <Link
          href="/admin/intelligence/candidate-dossiers/kelly-grappe"
          className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-950"
        >
          Kelly alignment profile
        </Link>
        <Link
          href="/admin/intelligence/candidate-dossiers"
          className="rounded-full border border-rose-300/60 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-950"
        >
          Full dossiers
        </Link>
      </V4PageHeader>

      <V4AllCandidateDossiersHub />

      <KimHammerModuleNavPanel compact />

      <section className="my-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/intelligence/film-room"
          className="flex flex-col rounded-xl border-2 border-violet-300 bg-violet-50/40 p-5 shadow-sm transition hover:border-violet-500"
        >
          <p className="text-[10px] font-bold uppercase text-violet-900">Debate performance</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-kelly-navy">Film room</h2>
          <p className="mt-2 flex-1 text-sm text-kelly-muted">
            KATV/THV11 transcripts, media drills, cross-exam bank, argument library — rehearse before stage.
          </p>
          <p className="mt-3 text-xs font-bold text-violet-900">Open film room →</p>
        </Link>
        <Link
          href="/admin/intelligence/candidate-dossiers/kelly-grappe"
          className="flex flex-col rounded-xl border-2 border-emerald-300 bg-emerald-50/40 p-5 shadow-sm transition hover:border-emerald-500"
        >
          <p className="text-[10px] font-bold uppercase text-emerald-900">Your profile · Production</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-kelly-navy">Kelly Grappe</h2>
          <p className="mt-2 flex-1 text-sm text-kelly-muted">12 alignment sections, crosswalk table, 30-second bio, debate framing examples.</p>
        </Link>
        <Link
          href="/admin/intelligence/opponents/dossiers/kim-hammer"
          className="flex flex-col rounded-xl border-2 border-kelly-navy/20 bg-white p-5 shadow-sm transition hover:border-kelly-navy"
        >
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Dossier · Production</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-kelly-navy">Kim Hammer</h2>
          <p className="mt-2 flex-1 text-sm text-kelly-muted">8 narrative sections, claims ledger, lead stories, ACCA panel tactics.</p>
        </Link>
        <Link
          href="/admin/intelligence/opponents/dossiers/michael-packo"
          className="rounded-xl border-2 border-amber-200 bg-amber-50/30 p-5 transition hover:border-amber-400"
        >
          <p className="text-[10px] font-bold uppercase text-amber-900">Dossier · Partial verified</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-kelly-navy">Michael Pakko</h2>
          <p className="mt-2 text-sm text-kelly-muted">8 sections, bio timeline, three-way geometry, quote ledger starter.</p>
        </Link>
        <Link
          href="/admin/intelligence/opponents/michael-packo"
          className="flex flex-col rounded-xl border-2 border-amber-300 bg-amber-50/50 p-5 shadow-sm transition hover:border-amber-500"
        >
          <p className="text-[10px] font-bold uppercase text-amber-900">Command center · Phase 0</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-kelly-navy">Pakko command center</h2>
          <p className="mt-2 flex-1 text-sm text-kelly-muted">
            One front door — quotes, contrast, finance, diligence, coaching. Start here for third-candidate prep.
          </p>
          <p className="mt-3 text-xs font-bold text-amber-900">Open command center →</p>
        </Link>
        <Link
          href="/admin/intelligence/kim-hammer"
          className="flex flex-col rounded-xl border border-kelly-text/10 bg-white p-5 shadow-sm transition hover:border-kelly-navy/40"
        >
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Command center</p>
          <h2 className="mt-1 font-heading text-lg font-bold text-kelly-navy">Hammer modules</h2>
          <p className="mt-2 flex-1 text-sm text-kelly-muted">Bills, timeline, debate prep, evidence command.</p>
        </Link>
      </section>

      <p className="mb-4 text-xs">
        <Link href="/admin/intelligence/kelly-debate-coaching" className="font-bold text-violet-900 underline">
          Kelly debate coaching — three-way strategy, openings, closings →
        </Link>
      </p>

      <V7MichaelPackoScaffoldPanel />
    </div>
  );
}
