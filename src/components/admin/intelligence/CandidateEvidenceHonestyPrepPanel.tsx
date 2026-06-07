import Link from "next/link";
import { EvidenceHonestyBadge } from "@/components/admin/intelligence/EvidenceHonestyBadge";
import type { EvidenceHonestySurface } from "@/lib/intelligence/v4/phase15P5EvidenceHonesty";

const KIND_LABEL: Record<EvidenceHonestySurface["kind"], string> = {
  "film-room": "Film room",
  "briefing-papers": "Briefing papers",
  "opposition-strategy": "Opposition",
  "morning-brief": "Morning brief",
  "trap-lanes": "Trap lanes",
  "sos-questions": "SOS questions",
  "debate-coaching": "Debate coaching",
  "claims-ledger": "Claims ledger",
};

export function CandidateEvidenceHonestyPrepPanel({ surfaces }: { surfaces: EvidenceHonestySurface[] }) {
  const rehearse = surfaces.filter((s) =>
    ["film-room", "trap-lanes", "sos-questions", "debate-coaching"].includes(s.kind),
  );
  const research = surfaces.filter((s) =>
    ["briefing-papers", "opposition-strategy", "morning-brief", "claims-ledger"].includes(s.kind),
  );

  return (
    <div className="space-y-8">
      {(
        [
          ["Rehearse surfaces — badge before proof language", rehearse],
          ["Research surfaces — operator drafts and ledger tiers", research],
        ] as const
      ).map(([title, rows]) => (
        <section key={title}>
          <h2 className="mb-3 font-heading text-lg font-bold text-kelly-navy">{title}</h2>
          <div className="space-y-3">
            {rows.map((surface) => (
              <article key={surface.surfaceId} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-amber-950">{KIND_LABEL[surface.kind]}</p>
                    <Link href={surface.href} className="mt-1 block font-bold text-kelly-navy underline">
                      {surface.title}
                    </Link>
                    <p className="mt-2 text-xs text-kelly-muted">{surface.kellyRule}</p>
                  </div>
                  <EvidenceHonestyBadge badge={surface.defaultBadge} compact showMessage />
                </div>
                <p className="mt-2 text-[10px] font-bold text-kelly-subtle">{surface.governanceLabel}</p>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
