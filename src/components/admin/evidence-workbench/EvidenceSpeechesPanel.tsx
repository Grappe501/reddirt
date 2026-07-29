"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  buildSpeechMetadataPacketAction,
  saveSpeechEvidenceAction,
  suggestSpeechEvidenceAiAction,
} from "@/app/admin/evidence-workbench-actions";
import type { SpeechEvidenceOverlay } from "@/lib/campaign-media/evidence-types";
import { mergeAiCountyIntoList } from "@/lib/campaign-media/evidence-validation";
import { EVIDENCE_FIELD_CLASS } from "@/components/admin/evidence-workbench/field-styles";
import { isEditableKeyboardTarget } from "@/components/admin/evidence-workbench/keyboard";

export type SpeechWorkbenchItem = {
  id: string;
  title: string;
  slug: string;
  youtubeVideoId: string;
  thumbnailUrl?: string;
  baseCounties: string[];
  basePublicationStatus?: string;
  overlay: SpeechEvidenceOverlay | null;
};

type Props = {
  speeches: SpeechWorkbenchItem[];
  initialSpeechId?: string;
};

type Filter = "all" | "noCounty" | "needsApproval" | "approved";

export function EvidenceSpeechesPanel({ speeches, initialSpeechId }: Props) {
  const startIdx = Math.max(0, initialSpeechId ? speeches.findIndex((s) => s.id === initialSpeechId) : 0);
  const [filter, setFilter] = useState<Filter>("noCounty");
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(startIdx >= 0 ? startIdx : 0);
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return speeches.filter((s) => {
      const counties = (s.overlay?.counties?.length ? s.overlay.counties : s.baseCounties) ?? [];
      const approved = Boolean(s.overlay?.approvedForPublic);
      if (filter === "noCounty" && counties.length > 0) return false;
      if (filter === "needsApproval" && approved) return false;
      if (filter === "approved" && !approved) return false;
      if (!q) return true;
      return (
        s.id.toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q) ||
        counties.join(",").toLowerCase().includes(q)
      );
    });
  }, [speeches, filter, query]);

  const speech = filtered[Math.min(index, Math.max(0, filtered.length - 1))];

  const initial = useMemo(() => {
    if (!speech) return null;
    const o = speech.overlay;
    return {
      counties: (o?.counties?.length ? o.counties : speech.baseCounties).join(", "),
      city: o?.city ?? "",
      venue: o?.venue ?? "",
      eventDate: o?.eventDate ?? "",
      eventName: o?.eventName ?? "",
      whatThisProves: o?.whatThisProves ?? "",
      approvedForPublic: o?.approvedForPublic ?? false,
      homepageCandidate: o?.homepageCandidate ?? false,
      publicationStatus: o?.publicationStatus ?? speech.basePublicationStatus ?? "DRAFT",
    };
  }, [speech]);

  const [form, setForm] = useState(initial);
  useEffect(() => setForm(initial), [initial]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (isEditableKeyboardTarget(e.target)) return;
      if (e.key === "ArrowLeft" || e.key === "j") setIndex((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight" || e.key === "k") setIndex((i) => Math.min(filtered.length - 1, i + 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtered.length]);

  if (!speech || !form) {
    return <p className="font-body text-sm text-[#364272]">No speeches match this filter.</p>;
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
      fd.set("venue", snapshot.venue);
      fd.set("eventDate", snapshot.eventDate);
      fd.set("eventName", snapshot.eventName);
      fd.set("whatThisProves", snapshot.whatThisProves);
      if (snapshot.approvedForPublic) fd.set("approvedForPublic", "on");
      if (snapshot.homepageCandidate) fd.set("homepageCandidate", "on");
      fd.set("publicationStatus", snapshot.publicationStatus);
      const res = await saveSpeechEvidenceAction(null, fd);
      setMessage(res.message);
    });
  }

  function suggestAi() {
    const speechId = speech.id;
    start(async () => {
      const res = await suggestSpeechEvidenceAiAction(speechId);
      setMessage(res.message);
      if (!res.ok || !res.suggestion) return;
      const s = res.suggestion;
      setForm((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          counties: mergeAiCountyIntoList(prev.counties, s.county),
          city: s.city === "Unknown" ? prev.city : s.city,
          venue: s.venue === "Unknown" ? prev.venue : s.venue,
          eventDate: s.eventDate === "Unknown" ? prev.eventDate : s.eventDate,
          eventName: s.eventName === "Unknown" ? prev.eventName : s.eventName,
          whatThisProves: s.whatThisProves || prev.whatThisProves,
        };
      });
      const extras: string[] = [];
      if (s.toolsUsed?.length) extras.push(`Tools: ${s.toolsUsed.join(", ")}`);
      if (s.speakerNotes) extras.push(`Speaker notes: ${s.speakerNotes}`);
      if (s.sceneTags?.length) extras.push(`Tags: ${s.sceneTags.join(", ")}`);
      if (s.warnings.length) extras.push(`Warnings: ${s.warnings.join("; ")}`);
      if (extras.length) setMessage(`${res.message}\n${extras.join("\n")}`);
    });
  }

  function buildPacket() {
    const speechId = speech.id;
    const confirmed = Boolean(
      form?.counties?.trim() &&
        form.counties.toLowerCase() !== "unknown" &&
        form.city?.trim() &&
        form.city !== "Unknown",
    );
    start(async () => {
      const res = await buildSpeechMetadataPacketAction(speechId, confirmed);
      setMessage(res.message);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["noCounty", "No counties"],
            ["needsApproval", "Needs approval"],
            ["approved", "Approved"],
            ["all", "All"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setFilter(id);
              setIndex(0);
            }}
            className={`rounded-md border px-3 py-1.5 font-body text-xs font-semibold ${
              filter === id
                ? "border-[#000066] bg-[#000066] text-white"
                : "border-[#8eb6dc] bg-white text-[#12124a]"
            }`}
          >
            {label}
          </button>
        ))}
        <input
          className={`${EVIDENCE_FIELD_CLASS} max-w-xs`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search speeches"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              className="rounded border-2 border-[#8eb6dc] bg-white px-3 py-1.5 font-body text-sm text-[#12124a]"
              disabled={index <= 0}
              onClick={() => setIndex((i) => i - 1)}
            >
              ← Prev
            </button>
            <p className="font-body text-xs text-[#364272]">
              {index + 1} / {filtered.length}
            </p>
            <button
              type="button"
              className="rounded border-2 border-[#8eb6dc] bg-white px-3 py-1.5 font-body text-sm text-[#12124a]"
              disabled={index >= filtered.length - 1}
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
              className="mt-3 w-full rounded-lg border border-[#8eb6dc]/40 object-cover"
            />
          ) : null}
          <h3 className="mt-3 font-heading text-lg font-bold text-[#12124a]">{speech.title}</h3>
          <p className="font-mono text-xs text-[#364272]">{speech.id}</p>
          <div className="mt-2 flex flex-wrap gap-3 font-body text-sm">
            <a
              className="font-semibold text-[#000066] underline"
              href={`https://www.youtube.com/watch?v=${speech.youtubeVideoId}`}
              target="_blank"
              rel="noreferrer"
            >
              Open on YouTube ↗
            </a>
            <Link
              className="font-semibold text-[#000066] underline"
              href={`/admin/media/youtube/${speech.youtubeVideoId}`}
            >
              Transcript editor
            </Link>
            <Link className="font-semibold text-[#000066] underline" href={`/kelly-speaks`}>
              Kelly Speaks
            </Link>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border-2 border-[#000066]/15 bg-white p-4 text-[#12124a]">
          <label className="block font-body text-xs font-semibold">
            Counties (comma-separated short names)
            <input
              className={EVIDENCE_FIELD_CLASS}
              value={form.counties}
              onChange={(e) => setForm({ ...form, counties: e.target.value })}
            />
          </label>
          {(
            [
              ["city", "City"],
              ["venue", "Venue"],
              ["eventDate", "Event date"],
              ["eventName", "Event name"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block font-body text-xs font-semibold">
              {label}
              <input
                className={EVIDENCE_FIELD_CLASS}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </label>
          ))}
          <label className="block font-body text-xs font-semibold">
            What this proves
            <textarea
              className={EVIDENCE_FIELD_CLASS}
              rows={3}
              value={form.whatThisProves}
              onChange={(e) => setForm({ ...form, whatThisProves: e.target.value })}
            />
          </label>
          <div className="flex flex-wrap gap-4 font-body text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.approvedForPublic}
                onChange={(e) => setForm({ ...form, approvedForPublic: e.target.checked })}
              />
              Approved for public
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.homepageCandidate}
                onChange={(e) => setForm({ ...form, homepageCandidate: e.target.checked })}
              />
              Homepage / hub candidate
            </label>
          </div>
          <label className="block font-body text-xs font-semibold">
            Publication
            <select
              className={EVIDENCE_FIELD_CLASS}
              value={form.publicationStatus}
              onChange={(e) => setForm({ ...form, publicationStatus: e.target.value })}
            >
              {["DRAFT", "IN_REVIEW", "APPROVED", "PUBLISHED", "ARCHIVED"].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={suggestAi}
              className="rounded-md border-2 border-[#000066] bg-white px-4 py-2 font-body text-sm font-bold text-[#000066] disabled:opacity-50"
            >
            Suggest with AI (tools)
          </button>
            <button
              type="button"
              disabled={pending}
              onClick={save}
              className="rounded-md bg-[#000066] px-4 py-2 font-body text-sm font-bold text-white disabled:opacity-50"
            >
              Save speech evidence
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={buildPacket}
              className="rounded-md border-2 border-[#8eb6dc] bg-white px-4 py-2 font-body text-sm font-semibold text-[#12124a] disabled:opacity-50"
            >
              Build outgoing metadata packet
            </button>
          </div>
          {message ? (
            <p className="whitespace-pre-wrap font-body text-sm text-[#364272]">{message}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
