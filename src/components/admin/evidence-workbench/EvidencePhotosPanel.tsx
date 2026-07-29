"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  buildPhotoMetadataPacketAction,
  savePhotoEvidenceAction,
  suggestPhotoEvidenceAiAction,
} from "@/app/admin/evidence-workbench-actions";
import type { PhotoEvidenceOverlay } from "@/lib/campaign-media/evidence-types";

export type PhotoWorkbenchItem = {
  id: string;
  src: string;
  caption: string;
  alt: string;
  base: {
    county: string;
    city: string;
    venue: string;
    eventDate: string;
    eventName: string;
    photographer: string;
    peopleVisible: string[];
    homepageCandidate: boolean;
    featuredPhoto: boolean;
    heroLevel: string;
    publicationStatus: string;
  };
  overlay: PhotoEvidenceOverlay | null;
};

type CountyOpt = { slug: string; displayName: string; shortName: string };

type Props = {
  photos: PhotoWorkbenchItem[];
  counties: CountyOpt[];
  initialIndex?: number;
};

function field(overlay: PhotoEvidenceOverlay | null, base: string, key: keyof PhotoEvidenceOverlay): string {
  const o = overlay?.[key];
  if (typeof o === "string" && o.trim()) return o;
  return base === "Unknown" ? "" : base;
}

export function EvidencePhotosPanel({ photos, counties, initialIndex = 0 }: Props) {
  const [index, setIndex] = useState(Math.min(Math.max(0, initialIndex), Math.max(0, photos.length - 1)));
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  const photo = photos[index];

  const initialForm = useMemo(() => {
    if (!photo) return null;
    const o = photo.overlay;
    return {
      county: field(o, photo.base.county, "county"),
      city: field(o, photo.base.city, "city"),
      venue: field(o, photo.base.venue, "venue"),
      eventDate: field(o, photo.base.eventDate, "eventDate"),
      eventName: field(o, photo.base.eventName, "eventName"),
      photographer: field(o, photo.base.photographer, "photographer"),
      peopleVisible: (o?.peopleVisible?.length ? o.peopleVisible : photo.base.peopleVisible).join(", "),
      whatThisProves: o?.whatThisProves ?? "",
      approvedForPublic: o?.approvedForPublic ?? false,
      homepageCandidate: o?.homepageCandidate ?? photo.base.homepageCandidate,
      featuredPhoto: o?.featuredPhoto ?? photo.base.featuredPhoto,
      heroLevel: o?.heroLevel ?? photo.base.heroLevel,
      tierIntent: o?.tierIntent ?? "",
      publicationStatus: o?.publicationStatus ?? photo.base.publicationStatus,
    };
  }, [photo]);

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setIndex((i) => Math.min(photos.length - 1, i + 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [photos.length]);

  if (!photo || !form) {
    return <p className="font-body text-sm text-kelly-slate">No campaign photos in registry.</p>;
  }

  function save() {
    if (!form) return;
    const photoId = photo.id;
    const snapshot = form;
    start(async () => {
      const fd = new FormData();
      fd.set("photoId", photoId);
      fd.set("county", snapshot.county || "Unknown");
      fd.set("city", snapshot.city || "Unknown");
      fd.set("venue", snapshot.venue || "Unknown");
      fd.set("eventDate", snapshot.eventDate || "Unknown");
      fd.set("eventName", snapshot.eventName || "Unknown");
      fd.set("photographer", snapshot.photographer || "Unknown");
      fd.set("peopleVisible", snapshot.peopleVisible);
      fd.set("whatThisProves", snapshot.whatThisProves);
      if (snapshot.approvedForPublic) fd.set("approvedForPublic", "on");
      if (snapshot.homepageCandidate) fd.set("homepageCandidate", "on");
      if (snapshot.featuredPhoto) fd.set("featuredPhoto", "on");
      fd.set("heroLevel", snapshot.heroLevel);
      fd.set("tierIntent", snapshot.tierIntent);
      fd.set("publicationStatus", snapshot.publicationStatus);
      const res = await savePhotoEvidenceAction(null, fd);
      setMessage(res.message);
    });
  }

  function suggestAi() {
    const photoId = photo.id;
    start(async () => {
      const res = await suggestPhotoEvidenceAiAction(photoId);
      setMessage(res.message);
      if (!res.ok || !res.suggestion) return;
      const s = res.suggestion;
      setForm((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          county: s.county === "Unknown" ? prev.county : s.county,
          city: s.city === "Unknown" ? prev.city : s.city,
          venue: s.venue === "Unknown" ? prev.venue : s.venue,
          eventDate: s.eventDate === "Unknown" ? prev.eventDate : s.eventDate,
          eventName: s.eventName === "Unknown" ? prev.eventName : s.eventName,
          photographer: s.photographer === "Unknown" ? prev.photographer : s.photographer,
          peopleVisible: s.peopleVisible.length ? s.peopleVisible.join(", ") : prev.peopleVisible,
          whatThisProves: s.whatThisProves || prev.whatThisProves,
        };
      });
      if (s.warnings.length) {
        setMessage(`${res.message}\nWarnings: ${s.warnings.join("; ")}`);
      }
    });
  }

  function buildPacket() {
    const photoId = photo.id;
    const confirmed =
      Boolean(form?.county && form.county !== "Unknown" && form.city && form.city !== "Unknown");
    start(async () => {
      const res = await buildPhotoMetadataPacketAction(photoId, confirmed);
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
            {index + 1} / {photos.length} · ← → keys
          </p>
          <button
            type="button"
            className="rounded border border-kelly-text/15 px-3 py-1.5 font-body text-sm"
            disabled={index >= photos.length - 1}
            onClick={() => setIndex((i) => i + 1)}
          >
            Next →
          </button>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.src}
          alt={photo.alt}
          className="mt-3 max-h-[28rem] w-full rounded-lg border border-kelly-text/10 object-contain bg-kelly-fog/40"
        />
        <p className="mt-2 font-mono text-xs text-kelly-slate">{photo.id}</p>
        <p className="mt-1 font-body text-sm text-kelly-text/80">{photo.caption}</p>
      </div>

      <div className="space-y-3 rounded-lg border border-kelly-text/10 bg-white p-4">
        <h3 className="font-heading text-lg font-bold">Evidence fields</h3>
        <p className="font-body text-xs text-kelly-slate">Leave blank / Unknown — never invent geography.</p>

        <label className="block font-body text-xs font-semibold">
          County
          <select
            className="mt-1 w-full rounded border border-kelly-text/15 px-2 py-1.5 text-sm"
            value={form.county}
            onChange={(e) => setForm({ ...form, county: e.target.value })}
          >
            <option value="">Unknown</option>
            {counties.map((c) => (
              <option key={c.slug} value={c.shortName}>
                {c.displayName}
              </option>
            ))}
          </select>
        </label>

        {(
          [
            ["city", "City"],
            ["venue", "Venue"],
            ["eventDate", "Event date"],
            ["eventName", "Event name"],
            ["photographer", "Photographer"],
            ["peopleVisible", "People (comma-separated)"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block font-body text-xs font-semibold">
            {label}
            <input
              className="mt-1 w-full rounded border border-kelly-text/15 px-2 py-1.5 text-sm"
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          </label>
        ))}

        <label className="block font-body text-xs font-semibold">
          What this proves
          <textarea
            className="mt-1 w-full rounded border border-kelly-text/15 px-2 py-1.5 text-sm"
            rows={3}
            value={form.whatThisProves}
            onChange={(e) => setForm({ ...form, whatThisProves: e.target.value })}
          />
        </label>

        <div className="flex flex-wrap gap-4 font-body text-sm">
          {(
            [
              ["approvedForPublic", "Approved for public"],
              ["homepageCandidate", "Homepage candidate"],
              ["featuredPhoto", "Lead / featured"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
              />
              {label}
            </label>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block font-body text-xs font-semibold">
            Hero level
            <select
              className="mt-1 w-full rounded border border-kelly-text/15 px-2 py-1.5 text-sm"
              value={form.heroLevel}
              onChange={(e) => setForm({ ...form, heroLevel: e.target.value })}
            >
              {["UNREVIEWED", "SUPPORTING", "FEATURE", "HERO"].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="block font-body text-xs font-semibold">
            Tier intent
            <select
              className="mt-1 w-full rounded border border-kelly-text/15 px-2 py-1.5 text-sm"
              value={form.tierIntent}
              onChange={(e) =>
                setForm({
                  ...form,
                  tierIntent: e.target.value as "" | "Gold" | "Silver" | "Archive",
                })
              }
            >
              <option value="">—</option>
              <option value="Gold">Gold</option>
              <option value="Silver">Silver</option>
              <option value="Archive">Archive</option>
            </select>
          </label>
          <label className="block font-body text-xs font-semibold">
            Publication
            <select
              className="mt-1 w-full rounded border border-kelly-text/15 px-2 py-1.5 text-sm"
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
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={suggestAi}
            className="rounded-md border border-kelly-navy px-4 py-2 font-body text-sm font-bold text-kelly-navy disabled:opacity-50"
          >
            Suggest with AI
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={save}
            className="rounded-md bg-kelly-navy px-4 py-2 font-body text-sm font-bold text-white disabled:opacity-50"
          >
            Save photo evidence
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={buildPacket}
            className="rounded-md border border-kelly-text/20 px-4 py-2 font-body text-sm font-semibold disabled:opacity-50"
          >
            Build outgoing metadata packet
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              start(async () => {
                const { refreshCountyAlbumsAction } = await import("@/app/admin/evidence-workbench-actions");
                const res = await refreshCountyAlbumsAction(true);
                setMessage(res.message);
              });
            }}
            className="rounded-md border border-kelly-text/20 px-4 py-2 font-body text-sm font-semibold disabled:opacity-50"
          >
            Rebuild county folders
          </button>
        </div>
        {message ? <p className="font-body text-sm text-kelly-slate whitespace-pre-wrap">{message}</p> : null}
      </div>
    </div>
  );
}
