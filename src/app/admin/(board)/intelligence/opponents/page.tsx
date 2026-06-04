import Link from "next/link";
import { V7MichaelPackoScaffoldPanel } from "@/components/admin/intelligence/v4/V7MichaelPackoScaffoldPanel";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";

export default function OpponentsHubPage() {
  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Kelly · multi-candidate opposition"
        title="Opponents hub"
        description="Kim Hammer is production-ready in this workbench. Michael Packo (Libertarian) is on scaffold — complete retrieval tasks before public contrast."
      >
        <V4BackLinks />
      </V4PageHeader>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          href="/admin/intelligence/kim-hammer"
          className="flex flex-col rounded-xl border-2 border-kelly-navy/20 bg-white p-5 shadow-sm transition hover:border-kelly-navy"
        >
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Production</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-kelly-navy">Kim Hammer</h2>
          <p className="mt-2 flex-1 text-sm text-kelly-muted">Full module map, bills, timeline, debate prep.</p>
        </Link>
        <Link
          href="/admin/intelligence/video-archive-room"
          className="rounded-xl border-2 border-amber-200 bg-amber-50/30 p-5 transition hover:border-amber-400"
        >
          <p className="text-[10px] font-bold uppercase text-amber-900">Scaffold + media catalog</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-kelly-navy">Michael Packo (Pakko)</h2>
          <p className="mt-2 text-sm text-kelly-muted">Video links on archive room — PBS, TBP, campaign site. Debate cross in coaching module.</p>
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
