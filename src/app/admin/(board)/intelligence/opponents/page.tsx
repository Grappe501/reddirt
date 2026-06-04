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

      <section className="mb-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/intelligence/kim-hammer"
          className="rounded-xl border-2 border-kelly-navy/20 bg-white p-5 shadow-sm transition hover:border-kelly-navy"
        >
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">Production</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-kelly-navy">Kim Hammer</h2>
          <p className="mt-2 text-sm text-kelly-muted">Full module map, bills, timeline, debate prep, film room.</p>
        </Link>
        <div className="rounded-xl border-2 border-amber-200 bg-amber-50/30 p-5">
          <p className="text-[10px] font-bold uppercase text-amber-900">Scaffold</p>
          <h2 className="mt-1 font-heading text-xl font-bold text-kelly-navy">Michael Packo</h2>
          <p className="mt-2 text-sm text-kelly-muted">Research priorities below — routes go live after ingest.</p>
        </div>
      </section>

      <V7MichaelPackoScaffoldPanel />
    </div>
  );
}
