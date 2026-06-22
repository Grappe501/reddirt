"use client";

import { useCallback, useEffect, useState } from "react";

import { AccaForumClipEmbed } from "@/components/election-plan/AccaForumClipEmbed";
import {
  DAY3_SUPERIORITY_CLIP_IDS,
  listAccaForumStudyClips,
} from "@/lib/election-plan/acca-forum-study-clips";

const STORAGE_KEY = "kelly-day3-superiority-clips-watched-v1";

function loadWatched(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

function saveWatched(state: Record<string, boolean>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

type PanelVariant = "manual" | "opposition" | "full";

const VARIANT_CLIP_IDS: Record<PanelVariant, readonly string[]> = {
  manual: ["kelly-opening-people", "kelly-clerk-partnership", "kelly-administrator-800"],
  opposition: ["hammer-opening-16yr", "hammer-bill-sponsor-list", "hammer-closing-ranking"],
  full: DAY3_SUPERIORITY_CLIP_IDS,
};

const VARIANT_COPY: Record<PanelVariant, { title: string; lead: string }> = {
  manual: {
    title: "Superiority clips · Kelly administrator beats",
    lead: "Watch Kelly's ACCA opening and administrator lines — steal tone and three-job beats for your notecards. No bill numbers.",
  },
  opposition: {
    title: "Contrast clips · Hammer author vs administrator",
    lead: "Watch Hammer's experience and bill-list frames — contrast on job fit, not smear. Link to Hammer admin example after claims gate.",
  },
  full: {
    title: "Superiority map · full clip stack",
    lead: "Kelly beats + Hammer contrast clips for Day 3 superiority stack rehearsal.",
  },
};

export function ElectionPlanDay3SuperiorityClipPanel({ variant = "full" }: { variant?: PanelVariant }) {
  const clipIds = VARIANT_CLIP_IDS[variant];
  const clips = listAccaForumStudyClips(clipIds);
  const copy = VARIANT_COPY[variant];
  const [watched, setWatched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setWatched(loadWatched());
  }, []);

  const toggle = useCallback((clipId: string) => {
    setWatched((prev) => {
      const next = { ...prev, [clipId]: !prev[clipId] };
      saveWatched(next);
      return next;
    });
  }, []);

  const watchedCount = clips.filter((c) => watched[c.id]).length;

  return (
    <section className="ep-card border-2 border-emerald-200 bg-emerald-50/20 p-5 text-sm">
      <p className="text-xs font-bold uppercase text-emerald-900">{copy.title}</p>
      <p className="mt-2 text-[var(--ep-navy-muted)]">{copy.lead}</p>

      <div className="mt-6 space-y-6">
        {clips.map((clip) => (
          <AccaForumClipEmbed
            key={clip.id}
            clip={clip}
            watched={watched[clip.id]}
            onToggleWatched={() => toggle(clip.id)}
          />
        ))}
      </div>

      <p className="mt-4 text-xs font-semibold text-emerald-950">
        {watchedCount >= clips.length
          ? "Clip stack complete — recite three green superiority beats from notecards."
          : `${watchedCount}/${clips.length} clips watched — stack three Kelly jobs before offense block.`}
      </p>
    </section>
  );
}
