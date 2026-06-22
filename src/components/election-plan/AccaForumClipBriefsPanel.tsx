"use client";

import { useCallback, useEffect, useState } from "react";

import { AccaForumClipBriefCard } from "@/components/election-plan/AccaForumClipBriefCard";
import type { AccaForumClipBrief } from "@/lib/election-plan/load-acca-forum-clip-briefs";

function loadReviewed(storageKey: string): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

function saveReviewed(storageKey: string, state: Record<string, boolean>) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function AccaForumClipBriefsPanel({
  briefs,
  storageKey,
  title,
  lead,
  minimumHint,
  completeHint,
}: {
  briefs: AccaForumClipBrief[];
  storageKey: string;
  title: string;
  lead: string;
  minimumHint: string;
  completeHint: string;
}) {
  const [reviewed, setReviewed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setReviewed(loadReviewed(storageKey));
  }, [storageKey]);

  const toggle = useCallback(
    (clipId: string) => {
      setReviewed((prev) => {
        const next = { ...prev, [clipId]: !prev[clipId] };
        saveReviewed(storageKey, next);
        return next;
      });
    },
    [storageKey],
  );

  const reviewedCount = briefs.filter((b) => reviewed[b.clipId]).length;

  return (
    <section className="ep-card border-2 border-indigo-200 bg-indigo-50/20 p-5 text-sm">
      <p className="text-xs font-bold uppercase text-indigo-900">{title}</p>
      <p className="mt-2 text-[var(--ep-navy-muted)]">{lead}</p>
      <p className="mt-2 text-xs font-semibold text-indigo-950">
        No video required — transcript excerpts and pull quotes are below. Read, mark your pivot, move on.
      </p>

      <div className="mt-6 space-y-6">
        {briefs.map((brief) => (
          <AccaForumClipBriefCard
            key={brief.clipId}
            brief={brief}
            reviewed={reviewed[brief.clipId]}
            onToggleReviewed={() => toggle(brief.clipId)}
          />
        ))}
      </div>

      <p className="mt-4 text-xs font-semibold text-indigo-950">
        {reviewedCount >= briefs.length ? completeHint : `${reviewedCount}/${briefs.length} briefs reviewed — ${minimumHint}`}
      </p>
    </section>
  );
}
