import {
  resolveEvidenceHonestyFromText,
  type EvidenceHonestyBadge as EvidenceHonestyBadgeType,
} from "@/lib/intelligence/v4/evidenceHonestyBadge";

const STYLE: Record<EvidenceHonestyBadgeType["tier"], string> = {
  verified: "border-emerald-300 bg-emerald-50 text-emerald-950",
  needs_review: "border-amber-300 bg-amber-50 text-amber-950",
  human_review: "border-sky-300 bg-sky-50 text-sky-950",
  non_publishable: "border-rose-400 bg-rose-50 text-rose-950",
  reference_only: "border-indigo-300 bg-indigo-50 text-indigo-950",
  research_question: "border-rose-300 bg-rose-50/80 text-rose-950",
  thin_evidence: "border-orange-300 bg-orange-50 text-orange-950",
};

export function EvidenceHonestyBadge({
  badge,
  compact,
  showMessage,
}: {
  badge: EvidenceHonestyBadgeType;
  compact?: boolean;
  showMessage?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border ${compact ? "px-2 py-1 text-[9px]" : "p-3 text-[10px]"} font-bold ${STYLE[badge.tier]}`}
    >
      <span className="uppercase tracking-wider">Evidence · {badge.label}</span>
      {showMessage && !compact ? (
        <p className="mt-1 font-normal normal-case leading-relaxed">{badge.kellyMessage}</p>
      ) : null}
    </div>
  );
}

export function EvidenceHonestyBadgeFromText({
  text,
  compact,
  showMessage,
}: {
  text: string;
  compact?: boolean;
  showMessage?: boolean;
}) {
  return (
    <EvidenceHonestyBadge
      badge={resolveEvidenceHonestyFromText(text)}
      compact={compact}
      showMessage={showMessage}
    />
  );
}
