"use client";

import { useCallback, useEffect, useState } from "react";

import { AccaForumClipEmbed } from "@/components/election-plan/AccaForumClipEmbed";
import { ACCA_2026_SOS_FORUM_EVENT } from "@/lib/election-plan/acca-forum-event";
import {
  DAY2_FILM_ROOM_CLIP_IDS,
  listAccaForumStudyClips,
} from "@/lib/election-plan/acca-forum-study-clips";

const STORAGE_KEY = "kelly-day2-film-clips-watched-v1";

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

export function ElectionPlanDay2FilmClipPanel() {
  const clips = listAccaForumStudyClips(DAY2_FILM_ROOM_CLIP_IDS);
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
    <section className="ep-card border-2 border-indigo-200 bg-indigo-50/20 p-5 text-sm">
      <p className="text-xs font-bold uppercase text-indigo-900">Film room · ACCA study clips</p>
      <p className="mt-2 text-[var(--ep-navy-muted)]">
        Five cut clips from the ACCA forum — watch each, pause at tells, then complete the worksheet below.
        No admin film-room login; timestamps open the official YouTube recording.
      </p>

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

      <p className="mt-4 text-xs font-semibold text-indigo-950">
        {watchedCount >= clips.length
          ? "Clip gate met — fill the tell worksheet and speak one ranking pivot on video."
          : `${watchedCount}/${clips.length} clips marked watched — minimum tonight: Hammer opening + ranking clip + Pakko segment.`}
      </p>

      <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
        Full recording:{" "}
        <a href={ACCA_2026_SOS_FORUM_EVENT.youtubeWatchUrl} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
          YouTube · {ACCA_2026_SOS_FORUM_EVENT.title} ↗
        </a>
      </p>
    </section>
  );
}
