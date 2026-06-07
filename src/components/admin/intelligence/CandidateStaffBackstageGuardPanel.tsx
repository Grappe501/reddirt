import Link from "next/link";
import type { StaffBackstageGuardSurface } from "@/lib/intelligence/v4/phase15P8StaffBackstage";

export function CandidateStaffBackstageGuardPanel({ surfaces }: { surfaces: StaffBackstageGuardSurface[] }) {
  return (
    <div className="space-y-3">
      {surfaces.map((surface) => (
        <article key={surface.surfaceId} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-sm">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase text-violet-950">{surface.kind}</p>
              <Link href={surface.href} className="mt-1 block font-bold text-kelly-navy underline">
                {surface.title}
              </Link>
            </div>
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-950">
              STAFF only
            </span>
          </div>
          <p className="mt-2 text-xs text-kelly-muted">{surface.guardReason}</p>
          <p className="mt-2 rounded-lg border border-violet-100 bg-violet-50/40 p-2 text-xs italic text-kelly-text">
            Kelly rule: {surface.kellyRule}
          </p>
        </article>
      ))}
    </div>
  );
}
