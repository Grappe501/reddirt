import Link from "next/link";
import { PackoContrastGateBanner } from "@/components/admin/intelligence/PackoContrastGateBanner";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { loadMichaelPackoContrast } from "@/lib/intelligence/v4/loadOpponentCandidateDossier";
import { PACKO_COMMAND_CENTER_ROUTES } from "@/lib/intelligence/opponents/packoCommandCenterRoutes";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function MichaelPackoContrastPage() {
  const contrast = loadMichaelPackoContrast();

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow="Governed contrast · three-way debate"
        title="Pakko contrast vs Kelly"
        description="Respectful third-party positioning — no attacks on Libertarian voters. Contrast frames are interpretation until counsel review on any court or finance hit."
      >
        <V4BackLinks />
        <Link
          href={PACKO_COMMAND_CENTER_ROUTES.hub}
          className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950"
        >
          Pakko command center
        </Link>
        <Link
          href={PACKO_COMMAND_CENTER_ROUTES.coaching}
          className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-950"
        >
          Kelly coaching
        </Link>
      </V4PageHeader>

      <PackoContrastGateBanner compact />

      <section className="mb-8 space-y-4">
        {contrast.contrastFrames.map((frame) => (
          <article key={frame.frame} className="rounded-xl border border-kelly-text/10 bg-white p-5 text-sm">
            <p className="text-[10px] font-bold uppercase text-violet-900">{frame.frame.replace(/_/g, " ")}</p>
            <p className="mt-2 text-kelly-muted">
              <span className="font-bold text-amber-950">Pakko: </span>
              {frame.packoPositionSummary}
            </p>
            <p className="mt-2 text-kelly-text">
              <span className="font-bold text-emerald-950">Kelly: </span>
              {frame.kellyContrast}
            </p>
          </article>
        ))}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-rose-200 bg-rose-50/40 p-5 text-sm">
          <h2 className="font-bold uppercase text-rose-950">Kelly do not</h2>
          <ul className="mt-3 list-inside list-disc space-y-2 text-xs text-rose-950">
            {contrast.kellyDoNot.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-5 text-sm">
          <h2 className="font-bold uppercase text-emerald-950">Kelly do</h2>
          <ul className="mt-3 list-inside list-disc space-y-2 text-xs text-emerald-950">
            {contrast.kellyDo.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
