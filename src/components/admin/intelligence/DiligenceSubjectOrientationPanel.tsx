import Link from "next/link";
import type { OpponentDiligenceSubject } from "@/lib/intelligence/v4/opponentDiligenceRegistry";
import type { OpponentDiligenceLogFile } from "@/lib/intelligence/v4/kellyCourtDiligenceLogTypes";
import { diligenceCompletionPctFromEntries } from "@/lib/intelligence/v4/kellyCourtDiligenceLogTypes";

type Props = {
  subject: OpponentDiligenceSubject;
  log: OpponentDiligenceLogFile;
};

const SUBJECT_BRIEFING: Record<
  OpponentDiligenceLogFile["subjectId"],
  { role: string; operatorNote: string; debateRule: string }
> = {
  "kelly-grappe": {
    role: "Defensive diligence — protect the candidate before debate-stage denial lines.",
    operatorNote:
      "Public civics facts (Stand Up Arkansas, Forevermost business frame) live in the public brief module. This log is staff search outcomes only — never mixed with campaign talking points.",
    debateRule:
      "If any row is NOT_SEARCHED: pivot to 'I am running to run the Secretary of State's office for every voter.' Never fabricate a clean search.",
  },
  "kim-hammer": {
    role: "Offensive diligence — factual logs on the incumbent, counsel gate on any hit.",
    operatorNote:
      "Pair civil hits with legislative record and county-burden modules before personal contrast. PACER is optional — document in notes if run.",
    debateRule:
      "If incomplete: stay on verified votes and public statements. No court speculation on stage.",
  },
  "michael-packo": {
    role: "Contrast diligence — five-search protocol plus PACKO finance/quote gates.",
    operatorNote:
      "Spelled Packo on campaign collateral; Pakko in some filings. Contrast attack framing stays blocked until PACKO-01 and PACKO-02 reach PARTIAL.",
    debateRule:
      "In clerk rooms: do not elevate the Libertarian third candidate unless asked. In debate: acknowledge reform goals, pivot to implementation.",
  },
};

export function DiligenceSubjectOrientationPanel({ subject, log }: Props) {
  const briefing = SUBJECT_BRIEFING[subject.subjectId];
  const pct = diligenceCompletionPctFromEntries(log.entries);
  const incomplete = log.entries.filter((e) => e.result === "NOT_SEARCHED" || e.result === "IN_PROGRESS").length;

  return (
    <section className="mb-6 rounded-xl border border-amber-200 bg-amber-50/30 p-5 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-2xl">
          <p className="text-[10px] font-bold uppercase text-amber-950">Subject operator briefing</p>
          <p className="mt-2 font-semibold text-kelly-navy">{briefing.role}</p>
          <p className="mt-2 text-kelly-muted">{briefing.operatorNote}</p>
          <p className="mt-3 rounded-lg border border-rose-100 bg-white/80 p-3 text-xs text-rose-950">
            <span className="font-bold">Debate-night rule:</span> {briefing.debateRule}
          </p>
        </div>
        <div className="text-right">
          <p className="font-heading text-3xl font-bold text-amber-900">{pct}%</p>
          <p className="text-[10px] font-bold uppercase text-kelly-subtle">
            {incomplete > 0 ? `${incomplete} searches open` : "All searches logged"}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <Link
          href={`/admin/intelligence/field-book/${subject.fieldBookSlug}`}
          className="rounded-full border border-kelly-gold/50 bg-white px-3 py-1 font-bold text-kelly-navy"
        >
          Field Book: {subject.fieldBookSlug.replace(/-/g, " ")} →
        </Link>
        <Link
          href="/admin/intelligence/field-book/court-diligence-protocol"
          className="rounded-full border border-rose-300 bg-white px-3 py-1 font-bold text-rose-950"
        >
          Court diligence protocol →
        </Link>
        <Link
          href="/admin/intelligence/field-book/counsel-review-frame"
          className="rounded-full border border-kelly-navy/20 px-3 py-1 font-bold text-kelly-navy"
        >
          Counsel review frame →
        </Link>
      </div>
    </section>
  );
}
