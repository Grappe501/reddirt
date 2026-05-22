"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  parseProfileIntelligenceV2FromSuggestionMetadata,
  type ProfileIntelligenceV2Metadata,
  type ProfileEvidenceFactType,
} from "@/lib/email-command-center/ai-profile-intelligence";
import { ProfileFactSuggestionsList } from "@/components/admin/email-workflow/EmailWorkflowProfileGraphControls";

export type ProfileReviewFactSuggestionRow = {
  id: string;
  emailWorkflowItemId: string;
  factValue: string;
  factKey: string;
  suggestionType: string;
  status: string;
  confidence: number | null;
  rationale: string | null;
  metadataJson: unknown;
  emailWorkflowItem: {
    id: string;
    title: string | null;
    whatSummary: string | null;
    status: string;
  };
  profile: { displayName: string | null; primaryEmail: string | null } | null;
};

type FilterId =
  | "highConfidence"
  | "needsReview"
  | "sensitiveRisky"
  | "audienceHint"
  | "volunteer"
  | "donor"
  | "issue";

const PROFILE_REVIEW_GROUP_ORDER = [
  "Do not store / high risk",
  "Needs human review",
  "Higher confidence (still approve manually)",
  "Other",
] as const;

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "highConfidence", label: "High confidence (≥0.70)" },
  { id: "needsReview", label: "Needs review" },
  { id: "sensitiveRisky", label: "Sensitive / risky" },
  { id: "audienceHint", label: "Audience-style" },
  { id: "volunteer", label: "Volunteer" },
  { id: "donor", label: "Donor (careful)" },
  { id: "issue", label: "Issue interest" },
];

function numConf(c: number | null | undefined): number {
  if (c == null || Number.isNaN(c)) return 0;
  return c;
}

function factTypeFromRow(row: ProfileReviewFactSuggestionRow, pi2: ProfileIntelligenceV2Metadata | null): ProfileEvidenceFactType | null {
  if (pi2?.factType) return pi2.factType;
  const m = row.factKey.match(/^pi2\.([a-z_]+)\./);
  if (m?.[1] && /^[a-z_]+$/.test(m[1])) return m[1] as ProfileEvidenceFactType;
  return null;
}

function rowMatchesFilter(row: ProfileReviewFactSuggestionRow, pi2: ProfileIntelligenceV2Metadata | null, f: FilterId): boolean {
  const conf = numConf(row.confidence);
  const risk = pi2?.riskLevel ?? "low";
  const needsHuman = pi2?.needsHumanReview ?? true;
  const dns = Boolean(pi2?.shouldNotStoreReason);
  const ft = factTypeFromRow(row, pi2);
  const labelAud = /\baudience\b/i.test(row.factValue) || /\bmessaging\b/i.test(row.factValue);

  switch (f) {
    case "highConfidence":
      return conf >= 0.7 && risk === "low" && !dns;
    case "needsReview":
      return needsHuman || risk !== "low" || dns;
    case "sensitiveRisky":
      return risk === "high" || dns;
    case "audienceHint":
      return ft === "issue_interest" || (ft === "neutral_fact" && labelAud);
    case "volunteer":
      return ft === "volunteer_signal";
    case "donor":
      return ft === "donor_signal_careful";
    case "issue":
      return ft === "issue_interest";
    default:
      return true;
  }
}

function groupLabel(pi2: ProfileIntelligenceV2Metadata | null, row: ProfileReviewFactSuggestionRow): string {
  const dns = Boolean(pi2?.shouldNotStoreReason);
  const risk = pi2?.riskLevel ?? "medium";
  if (dns || risk === "high") return "Do not store / high risk";
  if (pi2?.needsHumanReview || risk === "medium" || numConf(row.confidence) < 0.55) return "Needs human review";
  if (numConf(row.confidence) >= 0.7 && risk === "low") return "Higher confidence (still approve manually)";
  return "Other";
}

export function ProfileReviewFactSuggestionsPanel({ suggestions }: { suggestions: ProfileReviewFactSuggestionRow[] }) {
  const [active, setActive] = useState<Set<FilterId>>(new Set());

  const toggle = (id: FilterId) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const enriched = useMemo(() => {
    return suggestions.map((row) => {
      const pi2 = parseProfileIntelligenceV2FromSuggestionMetadata(row.metadataJson);
      return { row, pi2, group: groupLabel(pi2, row) };
    });
  }, [suggestions]);

  const filtered = useMemo(() => {
    if (!active.size) return enriched;
    return enriched.filter(({ row, pi2 }) => {
      for (const f of active) {
        if (!rowMatchesFilter(row, pi2, f)) return false;
      }
      return true;
    });
  }, [enriched, active]);

  const byGroup = useMemo(() => {
    const m = new Map<string, typeof filtered>();
    for (const g of PROFILE_REVIEW_GROUP_ORDER) m.set(g, []);
    for (const item of filtered) {
      const list = m.get(item.group) ?? m.get("Other")!;
      list.push(item);
    }
    return m;
  }, [filtered]);

  if (!suggestions.length) {
    return (
      <p className="text-[11px] text-kelly-muted" role="status">
        No pending profile fact suggestions.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => toggle(id)}
            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-colors ${
              active.has(id)
                ? "border-kelly-forest bg-kelly-forest/15 text-kelly-navy"
                : "border-kelly-text/15 bg-white text-kelly-text/75 hover:bg-kelly-fog/50"
            }`}
          >
            {label}
          </button>
        ))}
        {active.size ? (
          <button
            type="button"
            className="rounded-full border border-kelly-text/20 px-2 py-0.5 text-[10px] text-kelly-muted"
            onClick={() => setActive(new Set())}
          >
            Clear filters
          </button>
        ) : null}
      </div>
      <p className="text-[10px] text-kelly-muted">
        EMAIL-AI-PROFILE-INTELLIGENCE-2.0 — suggestions are grouped by risk and review posture. Evidence and “why suggested” come from
        staged metadata; operators must still approve — nothing auto-writes to canonical profiles.
      </p>

      {PROFILE_REVIEW_GROUP_ORDER.map((gName) => {
        const items = byGroup.get(gName) ?? [];
        if (!items.length) return null;
        return (
          <div key={gName} className="rounded-lg border border-kelly-text/12 bg-kelly-page/30 p-2">
            <h3 className="font-heading text-[11px] font-bold text-kelly-navy">{gName}</h3>
            <ul className="mt-2 space-y-3">
              {items.map(({ row, pi2 }) => (
                <li key={row.id} className="rounded border border-kelly-text/10 bg-white p-2 text-[11px]">
                  <p className="font-semibold text-kelly-navy">{row.factValue}</p>
                  <div className="mt-1 flex flex-wrap gap-1 text-[9px]">
                    <span className="rounded bg-kelly-fog/80 px-1 py-0.5 text-kelly-text/80">
                      confidence: {row.confidence != null ? row.confidence.toFixed(2) : "—"}
                    </span>
                    {pi2 ? (
                      <>
                        <span className="rounded bg-kelly-fog/80 px-1 py-0.5 text-kelly-text/80">risk: {pi2.riskLevel}</span>
                        <span className="rounded bg-kelly-fog/80 px-1 py-0.5 text-kelly-text/80">fact type: {pi2.factType}</span>
                        <span className="rounded bg-kelly-fog/80 px-1 py-0.5 text-kelly-text/80">source: {pi2.sourceType}</span>
                        {pi2.needsHumanReview ? (
                          <span className="rounded bg-amber-100/90 px-1 py-0.5 text-amber-950">needs review</span>
                        ) : null}
                      </>
                    ) : (
                      <span className="rounded bg-kelly-fog/80 px-1 py-0.5 text-kelly-muted">legacy row (no v2 metadata)</span>
                    )}
                  </div>
                  {pi2?.shouldNotStoreReason ? (
                    <p className="mt-2 rounded border border-rose-200/80 bg-rose-50/90 px-2 py-1 text-[10px] text-rose-950">
                      <strong>Do not store:</strong> {pi2.shouldNotStoreReason}
                    </p>
                  ) : null}
                  {pi2 ? (
                    <>
                      <p className="mt-2 text-[10px] font-semibold text-kelly-muted">Why suggested</p>
                      <p className="text-[10px] text-kelly-text/85">{pi2.whySuggested}</p>
                      <p className="mt-2 text-[10px] font-semibold text-kelly-muted">Evidence (source-labeled)</p>
                      <p className="whitespace-pre-wrap rounded bg-kelly-page/50 px-2 py-1 font-mono text-[10px] text-kelly-text/80">
                        {pi2.evidenceText || "—"}
                      </p>
                    </>
                  ) : row.rationale ? (
                    <p className="mt-2 whitespace-pre-wrap text-[10px] text-kelly-text/75">{row.rationale}</p>
                  ) : null}
                  <p className="mt-2 text-[10px] text-kelly-muted">
                    Item:{" "}
                    <Link className="font-semibold underline" href={`/admin/workbench/email-queue/${row.emailWorkflowItemId}`}>
                      {row.emailWorkflowItem.title ?? row.emailWorkflowItem.whatSummary ?? row.emailWorkflowItemId}
                    </Link>
                    {" · "}
                    {row.emailWorkflowItem.status}
                  </p>
                  {row.profile ? (
                    <p className="text-[10px] text-kelly-muted">
                      Profile: {row.profile.displayName ?? "—"} · {row.profile.primaryEmail ?? "no email hint"}
                    </p>
                  ) : null}
                  <div className="mt-2 border-t border-kelly-text/10 pt-2">
                    <ProfileFactSuggestionsList
                      itemId={row.emailWorkflowItemId}
                      suggestions={[
                        {
                          id: row.id,
                          factValue: row.factValue,
                          status: row.status,
                          factKey: row.factKey,
                          suggestionType: row.suggestionType,
                          confidence: row.confidence,
                          rationale: row.rationale,
                          metadataJson: row.metadataJson,
                        },
                      ]}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
