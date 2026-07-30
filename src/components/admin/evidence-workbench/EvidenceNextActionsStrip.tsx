import Link from "next/link";
import type { EvidenceNextAction } from "@/lib/campaign-media/evidence-next-actions";

type Props = {
  actions: EvidenceNextAction[];
  generatedAt: string;
};

/** Deterministic Next Actions strip — what the workbench wants you to do now. */
export function EvidenceNextActionsStrip({ actions, generatedAt }: Props) {
  return (
    <div className="mt-4 rounded-lg border-2 border-[#000066]/20 bg-white p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-heading text-sm font-bold text-[#000066]">Next actions · AI-ranked backlog</p>
        <p className="font-body text-[10px] text-[#364272]">
          Generated {new Date(generatedAt).toLocaleString()} · Prefer Unknown
        </p>
      </div>
      <ol className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((a, i) => (
          <li
            key={a.id}
            className="flex flex-col rounded-md border border-[#8eb6dc]/50 bg-[#f4f7fc] px-3 py-2"
          >
            <p className="font-heading text-xs font-bold text-[#000066]">
              {i + 1}. {a.title}
            </p>
            <p className="mt-1 flex-1 font-body text-[11px] text-[#364272]">{a.why}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Link
                href={a.href}
                className="font-body text-xs font-semibold text-[#000066] underline"
              >
                Open →
              </Link>
              {a.modeHint ? (
                <span className="rounded bg-[#000066]/10 px-1.5 py-0.5 font-mono text-[10px] text-[#000066]">
                  mode:{a.modeHint}
                </span>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
