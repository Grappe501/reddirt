"use client";

import type { MessageAudience, MessageCategory, MessageContext, RelationshipType } from "@/lib/message-engine";
import { MESSAGE_AUDIENCES, MESSAGE_CATEGORIES, MESSAGE_RELATIONSHIP_TYPES } from "@/lib/message-engine";
import { cn } from "@/lib/utils";

const RELATIONSHIP_LABEL: Record<RelationshipType, string> = {
  family: "Family",
  friend: "Friend",
  neighbor: "Neighbor",
  coworker: "Coworker",
  church_community: "Faith or community",
  local_leader: "Local leader",
};

const AUDIENCE_LABEL: Record<MessageAudience, string> = {
  supporter: "They usually lean our way",
  persuadable: "Open, not sure yet",
  skeptical: "Skeptical or cautious",
  disengaged: "Tuned out of politics lately",
  civic_leader: "Civic or community leader",
  volunteer_prospect: "Might volunteer with the right ask",
  donor_prospect: "Might give time or resources",
  candidate_prospect: "Might consider stepping up (private asks only)",
};

const CATEGORY_LABEL: Record<MessageCategory, string> = {
  power_of_5_onboarding: "Power of 5 & circle building",
  county_organizing: "County organizing",
  volunteer_recruitment: "Volunteer recruitment",
  listening_conversation: "Listening & curiosity",
  follow_up: "Follow-up",
  event_invite: "Event invite",
  petition_ask: "Petition or public comment",
  gotv_ask: "GOTV (use official rules only)",
  candidate_recruitment_ask: "Candidate recruitment (leader context)",
};

type Props = {
  context: MessageContext;
  onChange: (next: MessageContext) => void;
  /** Optional place label for story prompts — display name only, not used for targeting. */
  placeLabel: string;
  onPlaceLabelChange: (value: string) => void;
  className?: string;
  compact?: boolean;
};

/**
 * Relationship, audience, and mission focus — all optional filters for deterministic template picks.
 * No scoring, no hidden categories, no voter linkage.
 */
export function MessageContextControls({
  context,
  onChange,
  placeLabel,
  onPlaceLabelChange,
  className,
  compact,
}: Props) {
  const fieldClass = compact ? "text-xs py-1.5" : "text-sm py-2";

  return (
    <div
      className={cn(
        "rounded-2xl border border-kelly-navy/15 bg-white/90 p-4 shadow-sm",
        compact && "p-3",
        className,
      )}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-kelly-navy/60">Tune your suggestions</p>
      <p className="mt-1 text-xs leading-relaxed text-kelly-text/70">
        Pick what fits — nothing here labels someone behind their back. It only narrows friendly scripts you already have permission to use.
      </p>

      <div className={cn("mt-4 grid gap-3", !compact && "sm:grid-cols-2")}>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold text-kelly-text/80">Relationship</span>
          <select
            className={cn(
              "rounded-lg border border-kelly-text/15 bg-kelly-page px-3 font-body text-kelly-text",
              fieldClass,
            )}
            value={context.relationship ?? ""}
            onChange={(e) => {
              const v = e.target.value as RelationshipType | "";
              onChange({ ...context, relationship: v ? v : undefined });
            }}
          >
            <option value="">Any — you know them best</option>
            {MESSAGE_RELATIONSHIP_TYPES.map((r) => (
              <option key={r} value={r}>
                {RELATIONSHIP_LABEL[r]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-bold text-kelly-text/80">How they&apos;re showing up</span>
          <select
            className={cn(
              "rounded-lg border border-kelly-text/15 bg-kelly-page px-3 font-body text-kelly-text",
              fieldClass,
            )}
            value={context.audience ?? ""}
            onChange={(e) => {
              const v = e.target.value as MessageAudience | "";
              onChange({ ...context, audience: v ? v : undefined });
            }}
          >
            <option value="">Not sure — keep it broad</option>
            {MESSAGE_AUDIENCES.map((a) => (
              <option key={a} value={a}>
                {AUDIENCE_LABEL[a]}
              </option>
            ))}
          </select>
        </label>

        <label className={cn("flex flex-col gap-1", !compact && "sm:col-span-2")}>
          <span className="text-xs font-bold text-kelly-text/80">Mission focus (optional)</span>
          <select
            className={cn(
              "rounded-lg border border-kelly-text/15 bg-kelly-page px-3 font-body text-kelly-text",
              fieldClass,
            )}
            value={context.preferredCategory ?? ""}
            onChange={(e) => {
              const v = e.target.value as MessageCategory | "";
              onChange({ ...context, preferredCategory: v ? v : undefined });
            }}
          >
            <option value="">General — mix of ideas</option>
            {MESSAGE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
        </label>

        <label className={cn("flex flex-col gap-1", !compact && "sm:col-span-2")}>
          <span className="text-xs font-bold text-kelly-text/80">Place you have in mind (optional)</span>
          <input
            type="text"
            autoComplete="off"
            placeholder="e.g. your town or county — for local color only"
            className={cn(
              "rounded-lg border border-kelly-text/15 bg-kelly-page px-3 font-body text-kelly-text placeholder:text-kelly-text/40",
              fieldClass,
            )}
            value={placeLabel}
            onChange={(e) => onPlaceLabelChange(e.target.value)}
          />
          <span className="text-[11px] text-kelly-text/55">
            Helps fill place-based prompts. Skip it if you prefer to keep things general.
          </span>
        </label>
      </div>
    </div>
  );
}
