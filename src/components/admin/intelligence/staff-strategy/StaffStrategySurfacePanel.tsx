import Link from "next/link";
import type { StaffStrategySurfaceOverlay } from "@/lib/intelligence/v4/phase11P2StaffStrategyDepth";
import type { StaffStrategySurface } from "@/lib/intelligence/v4/staffStrategyCommandInventory";

export function StaffStrategySurfacePanel({
  surface,
  overlay,
}: {
  surface: StaffStrategySurface;
  overlay: StaffStrategySurfaceOverlay;
}) {
  return (
    <article className="rounded-xl border border-violet-200/80 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          {surface.nsiTag ? (
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-700">{surface.nsiTag}</p>
          ) : null}
          <h2 className="font-heading text-lg font-bold text-kelly-navy">
            <Link href={surface.href} className="underline">
              {surface.title}
            </Link>
          </h2>
          <p className="mt-1 text-xs text-kelly-muted">{overlay.strategicRole}</p>
        </div>
        <Link
          href={surface.href}
          className="rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-[10px] font-bold text-violet-950"
        >
          Open surface
        </Link>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Operator use</h3>
          <ul className="mt-1 list-inside list-disc text-xs text-kelly-muted">
            {overlay.operatorUse.map((line) => (
              <li key={line.slice(0, 48)}>{line}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Debate application</h3>
          <ul className="mt-1 list-inside list-disc text-xs text-kelly-muted">
            {overlay.debateApplication.map((line) => (
              <li key={line.slice(0, 48)}>{line}</li>
            ))}
          </ul>
        </div>
      </div>

      {surface.campaignSystemRefs.length > 0 ? (
        <p className="mt-3 text-[10px] text-kelly-subtle">
          Manual refs:{" "}
          {surface.campaignSystemRefs.map((ref) => (
            <Link
              key={ref}
              href={`/admin/intelligence/campaign-system-manual/${ref}`}
              className="mr-2 font-semibold text-kelly-navy underline"
            >
              {ref}
            </Link>
          ))}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {overlay.intelligenceLinks.slice(0, 6).map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full border border-violet-100 bg-violet-50/50 px-2 py-0.5 text-[10px] font-bold text-violet-950"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </article>
  );
}
