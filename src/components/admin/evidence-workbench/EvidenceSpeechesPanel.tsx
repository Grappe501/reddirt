"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { saveSpeechEvidenceAction } from "@/app/admin/evidence-workbench-actions";
import type { SpeechEvidenceOverlay } from "@/lib/campaign-media/evidence-types";

export type SpeechWorkbenchItem = {
  id: string;
  title: string;
  slug: string;
  youtubeVideoId: string;
  thumbnailUrl?: string;
  baseCounties: string[];
  overlay: SpeechEvidenceOverlay | null;
};

type Props = {
  speeches: SpeechWorkbenchItem[];
};

export function EvidenceSpeechesPanel({ speeches }: Props) {
  const [index, setIndex] = useState(0);
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  const speech = speeches[index];

  const initial = useMemo(() => {
    if (!speech) return null;
    const o = speech.overlay;
    return {
      counties: (o?.counties?.length ? o.counties : speech.baseCounties).join(", "),
      city: o?.city ?? "",
      whatThisProves: o?.whatThisProves ?? "",
      approvedForPublic: o?.approvedForPublic ?? false,
    };
  }, [speech]);

  const [form, setForm] = useState(initial);
  useEffect(() => setForm(initial), [initial]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setIndex((i) => Math.min(speeches.length - 1, i + 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [speeches.length]);

  if (!speech || !form) {
    return <p className="font-body text-sm text-kelly-slate">No speeches in media registry.</p>;
  }

  function save() {
    if (!form) return;
    const snapshot = form;
    const speechId = speech.id;
    start(async () => {
      const fd = new FormData();
      fd.set("speechId", speechId);
      fd.set("counties", snapshot.counties);
      fd.set("city", snapshot.city);
      fd.set("whatThisProves", snapshot.whatThisProves);
      if (snapshot.approvedForPublic) fd.set("approvedForPublic", "on");
      const res = await saveSpeechEvidenceAction(null, fd);
      setMessage(res.message);
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            className="rounded border border-kelly-text/15 px-3 py-1.5 font-body text-sm"
            disabled={index <= 0}
            onClick={() => setIndex((i) => i - 1)}
          >
            ← Prev
          </button>
          <p className="font-body text-xs text-kelly-slate">
            {index + 1} / {speeches.length}
          </p>
          <button
            type="button"
            className="rounded border border-kelly-text/15 px-3 py-1.5 font-body text-sm"
            disabled={index >= speeches.length - 1}
            onClick={() => setIndex((i) => i + 1)}
          >
            Next →
          </button>
        </div>
        {speech.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={speech.thumbnailUrl}
            alt=""
            className="mt-3 w-full rounded-lg border border-kelly-text/10 object-cover"
          />
        ) : null}
        <h3 className="mt-3 font-heading text-lg font-bold">{speech.title}</h3>
        <p className="font-mono text-xs text-kelly-slate">{speech.id}</p>
        <a
          className="mt-2 inline-block font-body text-sm text-kelly-blue underline"
          href={`https://www.youtube.com/watch?v=${speech.youtubeVideoId}`}
          target="_blank"
          rel="noreferrer"
        >
          Open on YouTube ↗
        </a>
      </div>

      <div className="space-y-3 rounded-lg border border-kelly-text/10 bg-white p-4">
        <label className="block font-body text-xs font-semibold">
          Counties (comma-separated short names, e.g. Polk, Garland)
          <input
            className="mt-1 w-full rounded border border-kelly-text/15 px-2 py-1.5 text-sm"
            value={form.counties}
            onChange={(e) => setForm({ ...form, counties: e.target.value })}
          />
        </label>
        <label className="block font-body text-xs font-semibold">
          City
          <input
            className="mt-1 w-full rounded border border-kelly-text/15 px-2 py-1.5 text-sm"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
        </label>
        <label className="block font-body text-xs font-semibold">
          What this proves
          <textarea
            className="mt-1 w-full rounded border border-kelly-text/15 px-2 py-1.5 text-sm"
            rows={3}
            value={form.whatThisProves}
            onChange={(e) => setForm({ ...form, whatThisProves: e.target.value })}
          />
        </label>
        <label className="inline-flex items-center gap-2 font-body text-sm">
          <input
            type="checkbox"
            checked={form.approvedForPublic}
            onChange={(e) => setForm({ ...form, approvedForPublic: e.target.checked })}
          />
          Approved for public
        </label>
        <button
          type="button"
          disabled={pending}
          onClick={save}
          className="block rounded-md bg-kelly-navy px-4 py-2 font-body text-sm font-bold text-white disabled:opacity-50"
        >
          Save speech evidence
        </button>
        {message ? <p className="font-body text-sm text-kelly-slate">{message}</p> : null}
      </div>
    </div>
  );
}
