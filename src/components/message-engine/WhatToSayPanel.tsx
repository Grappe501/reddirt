"use client";

import { useMemo, useState } from "react";
import type { MessageContext } from "@/lib/message-engine";
import {
  getConversationStarterSet,
  getFollowUpSet,
  getMessageRecommendations,
  getMessageTemplateById,
  MESSAGE_STARTER_FOLLOW_UP_PROMPTS,
  MESSAGE_STARTER_LOCAL_STORY_PROMPTS,
} from "@/lib/message-engine";
import { cn } from "@/lib/utils";
import { MessageCard } from "./MessageCard";
import { MessageContextControls } from "./MessageContextControls";

function mergeContext(base: MessageContext, placeLabel: string): MessageContext {
  const trimmed = placeLabel.trim();
  return {
    ...base,
    countyDisplayName: trimmed || undefined,
  };
}

/** Stable top-three starters: prefer filtered set, backfill from broad context if filters go thin. */
function pickConversationStarters(ctx: MessageContext) {
  const primary = getConversationStarterSet(ctx);
  if (primary.length >= 3) return primary.slice(0, 3);

  const seen = new Set(primary.map((p) => p.templateId));
  /** Broader picks when mission/relationship filters leave fewer than three starters. */
  const fallback = getConversationStarterSet({
    visibilityTier: ctx.visibilityTier,
    geographyScope: ctx.geographyScope,
    geographyAttachment: ctx.geographyAttachment,
    countyDisplayName: ctx.countyDisplayName,
    regionDisplayName: ctx.regionDisplayName,
    cityDisplayName: ctx.cityDisplayName,
    stateDisplayName: ctx.stateDisplayName,
    tone: ctx.tone,
    preferredCategory: undefined,
    audience: undefined,
    relationship: undefined,
  });
  const merged = [...primary];
  for (const r of fallback) {
    if (merged.length >= 3) break;
    if (!seen.has(r.templateId)) {
      seen.add(r.templateId);
      merged.push(r);
    }
  }
  return merged.slice(0, 3);
}

type Props = {
  className?: string;
  /** Tighter spacing for onboarding screens. */
  compact?: boolean;
  /** Optional visibility tier — defaults to volunteer-safe registry only. */
  visibilityTier?: MessageContext["visibilityTier"];
};

/**
 * Personal organizing panel: listening-first scripts from the message registry (deterministic picks only).
 */
export function WhatToSayPanel({ className, compact, visibilityTier = "public_volunteer" }: Props) {
  const [context, setContext] = useState<MessageContext>({ visibilityTier });
  const [placeLabel, setPlaceLabel] = useState("");

  const engineContext = useMemo(() => mergeContext(context, placeLabel), [context, placeLabel]);

  const starters = useMemo(() => pickConversationStarters(engineContext), [engineContext]);

  const followRecs = useMemo(() => getFollowUpSet(engineContext), [engineContext]);
  const followTemplate = followRecs[0] ? getMessageTemplateById(followRecs[0].templateId) : undefined;

  const followUpBlocks = useMemo(() => {
    const prompts = MESSAGE_STARTER_FOLLOW_UP_PROMPTS;
    if (followTemplate) {
      return [
        {
          key: `tpl-${followTemplate.id}`,
          title: followTemplate.title,
          body: followTemplate.body,
          hint: "Listen more than you talk. Swap the {{placeholders}} with your own honest wording — no need to sound perfect.",
        },
        {
          key: prompts[0].id,
          title: prompts[0].title,
          body: prompts[0].prompt,
          hint: prompts[0].timingHint ? `Timing: ${prompts[0].timingHint}` : undefined,
        },
      ];
    }
    return [
      {
        key: prompts[0].id,
        title: prompts[0].title,
        body: prompts[0].prompt,
        hint: prompts[0].timingHint ? `Timing: ${prompts[0].timingHint}` : undefined,
      },
      {
        key: prompts[1]?.id ?? "follow-2",
        title: prompts[1]?.title ?? "Follow-up",
        body: prompts[1]?.prompt ?? "",
        hint: prompts[1]?.timingHint ? `Timing: ${prompts[1].timingHint}` : undefined,
      },
    ].filter((b) => b.body.length > 0);
  }, [followTemplate]);

  const localStory = useMemo(() => {
    const raw = MESSAGE_STARTER_LOCAL_STORY_PROMPTS[0];
    if (!raw) return null;
    const place = engineContext.countyDisplayName?.trim() || "your area";
    const prompt = raw.prompt.replace(/\{\{place_name\}\}/g, place);
    const hint = `${raw.bridgeHint} (Place used: ${place} — change it above if you like.)`;
    return { ...raw, prompt, hint };
  }, [engineContext.countyDisplayName]);

  const nextAction = useMemo(() => {
    const { nextActions } = getMessageRecommendations(engineContext);
    return nextActions[0] ?? "Take a breath, pick one script, and lead with curiosity — you can always pause if it does not feel right.";
  }, [engineContext]);

  return (
    <section
      className={cn(
        "rounded-2xl border border-kelly-navy/12 bg-kelly-page/80 p-5 shadow-sm",
        compact && "p-4",
        className,
      )}
      aria-labelledby="what-to-say-heading"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-kelly-navy/55">Conversation Tools</p>
          <h2 id="what-to-say-heading" className={cn("font-heading font-bold text-kelly-navy", compact ? "mt-1 text-xl" : "mt-2 text-2xl")}>
            What to Say
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-kelly-text/80">
            Scripts are starting points — not a scorecard. Listen first, stay kind, and let people opt out with dignity. Nothing here runs in the
            background or guesses who someone is.
          </p>
        </div>
      </div>

      <MessageContextControls
        className={cn("mt-5", compact && "mt-4")}
        context={context}
        onChange={setContext}
        placeLabel={placeLabel}
        onPlaceLabelChange={setPlaceLabel}
        compact={compact}
      />

      <div className={cn("mt-6 space-y-4", compact && "mt-5 space-y-3")}>
        <h3 className="font-heading text-sm font-bold text-kelly-navy">Conversation starters</h3>
        <div className="grid gap-3 md:grid-cols-3">
          {starters.map((s) => {
            const t = getMessageTemplateById(s.templateId);
            const body = t?.body ?? s.rationale;
            return (
              <MessageCard
                key={s.templateId}
                kind="conversation_starter"
                title={s.title}
                body={body}
                hint="Lead with curiosity. It is okay to adapt the words so they sound like you."
                className={compact ? "p-3" : undefined}
              />
            );
          })}
        </div>

        <h3 className="pt-2 font-heading text-sm font-bold text-kelly-navy">Follow-ups</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {followUpBlocks.slice(0, 2).map((b) => (
            <MessageCard
              key={b.key}
              kind="follow_up"
              title={b.title}
              body={b.body}
              hint={b.hint}
              className={compact ? "p-3" : undefined}
            />
          ))}
        </div>

        {localStory ? (
          <>
            <h3 className="pt-2 font-heading text-sm font-bold text-kelly-navy">Local story prompt</h3>
            <MessageCard
              kind="local_story"
              title={localStory.title}
              body={localStory.prompt}
              hint={localStory.hint}
              className={compact ? "p-3" : undefined}
            />
          </>
        ) : null}

        <h3 className="pt-2 font-heading text-sm font-bold text-kelly-navy">Next best step</h3>
        <MessageCard kind="next_action" title="One practical move" body={nextAction} className={compact ? "p-3" : undefined} />
      </div>
    </section>
  );
}
