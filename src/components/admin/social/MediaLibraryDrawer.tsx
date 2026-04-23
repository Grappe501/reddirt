"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { Image as ImageIcon, Library, Loader2, Search, X } from "lucide-react";
import { OwnedMediaKind, SocialContentMediaRefPurpose } from "@prisma/client";
import {
  attachOwnedMediaToSocialAction,
  detachSocialMediaRefAction,
  listCampaignEventsForMediaFilterAction,
  listCountiesForMediaFilterAction,
  listMediaLibraryAction,
  listMediaRefsForSocialItemAction,
} from "@/app/admin/media-library-actions";
import type { MediaLibraryListItem, MediaRefListItem } from "@/lib/media-library/dto";
import type { MediaLibraryListFilters } from "@/lib/media-library/types";
import { socialEnumLabel } from "@/lib/social/enum-labels";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, NativeSelect, UiButton, UiInput, UiTextarea, UiScrollArea } from "./social-ui-primitives";
import { OwnedMediaSourceType } from "@prisma/client";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  socialContentItemId: string | null;
  /** Variants for “assign to platform” action */
  platformVariants: { id: string; label: string }[];
  onAttachComplete?: () => void;
};

function purposeLabel(p: SocialContentMediaRefPurpose) {
  switch (p) {
    case "SOCIAL_PLAN":
      return "Plan";
    case "VIDEO_REPURPOSE":
      return "Video";
    case "VISUAL":
      return "Visual";
    case "PLATFORM_VARIANT":
      return "Platform";
    default:
      return p;
  }
}

export function MediaLibraryDrawer({ open, onOpenChange, socialContentItemId, platformVariants, onAttachComplete }: Props) {
  const [q, setQ] = useState("");
  const [countyId, setCountyId] = useState("");
  const [eventId, setEventId] = useState("");
  const [kind, setKind] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [approvedOnly, setApprovedOnly] = useState<"" | "yes" | "no">("yes");
  const [transcript, setTranscript] = useState<"" | "yes" | "no">("");
  const [sourceLocalIndexed, setSourceLocalIndexed] = useState(false);
  const [items, setItems] = useState<MediaLibraryListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [refs, setRefs] = useState<MediaRefListItem[]>([]);
  const [countyOpts, setCountyOpts] = useState<{ id: string; displayName: string }[]>([]);
  const [eventOpts, setEventOpts] = useState<{ id: string; title: string; startAt: string }[]>([]);
  const [variantId, setVariantId] = useState<string>("");
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();
  const [attaching, setAttaching] = useState<string | null>(null);

  const filters = useMemo((): MediaLibraryListFilters => {
    const f: MediaLibraryListFilters = { take: 50, skip: 0 };
    if (q.trim()) f.q = q.trim();
    if (countyId) f.countyId = countyId;
    if (eventId) f.campaignEventId = eventId;
    if (kind) f.kind = kind as OwnedMediaKind;
    if (dateFrom) f.dateFrom = new Date(dateFrom).toISOString();
    if (dateTo) f.dateTo = new Date(dateTo + "T23:59:59.999Z").toISOString();
    if (approvedOnly === "yes") f.approvedForSocial = true;
    if (approvedOnly === "no") f.approvedForSocial = false;
    if (transcript === "yes") f.hasTranscript = true;
    if (transcript === "no") f.hasTranscript = false;
    if (sourceLocalIndexed) f.sourceTypes = [OwnedMediaSourceType.LOCAL_INDEXED];
    return f;
  }, [q, countyId, eventId, kind, dateFrom, dateTo, approvedOnly, transcript, sourceLocalIndexed]);

  const runSearch = useCallback(() => {
    start(async () => {
      const r = await listMediaLibraryAction(filters);
      setItems(r.items);
      setTotal(r.total);
    });
  }, [filters]);

  const loadRefs = useCallback(() => {
    if (!socialContentItemId) {
      setRefs([]);
      return;
    }
    start(async () => {
      const r = await listMediaRefsForSocialItemAction(socialContentItemId);
      if (r.ok) setRefs(r.items);
    });
  }, [socialContentItemId]);

  const loadMeta = useCallback(() => {
    start(async () => {
      const [c, e] = await Promise.all([listCountiesForMediaFilterAction(), listCampaignEventsForMediaFilterAction()]);
      if (c.ok) setCountyOpts(c.counties);
      if (e.ok) {
        setEventOpts(
          e.events.map((x) => ({
            id: x.id,
            title: x.title,
            startAt: x.startAt instanceof Date ? x.startAt.toISOString() : String(x.startAt),
          }))
        );
      }
    });
  }, []);

  useEffect(() => {
    if (open) {
      loadMeta();
      runSearch();
      loadRefs();
    }
  }, [open, loadMeta, runSearch, loadRefs]);

  const onAttach = (ownedMediaId: string, purpose: SocialContentMediaRefPurpose) => {
    if (!socialContentItemId) return;
    setAttaching(ownedMediaId);
    const tryAttach = async (confirmUnapproved: boolean) => {
      const r = await attachOwnedMediaToSocialAction(socialContentItemId, ownedMediaId, purpose, {
        socialPlatformVariantId:
          purpose === SocialContentMediaRefPurpose.PLATFORM_VARIANT ? (variantId || undefined) : undefined,
        note: note.trim() || undefined,
        confirmUnapproved,
      });
      if (r.ok) {
        setAttaching(null);
        setNote("");
        loadRefs();
        onAttachComplete?.();
        return;
      }
      if (r.error === "UNAPPROVED_NEEDS_CONFIRM" && !confirmUnapproved) {
        if (typeof window !== "undefined" && window.confirm("This asset is not approved for social. Attach anyway for internal planning?")) {
          await tryAttach(true);
        } else {
          setAttaching(null);
        }
        return;
      }
      setAttaching(null);
      alert(r.error);
    };
    start(() => tryAttach(false));
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/40 p-0 sm:p-4"
      role="dialog"
      aria-label="Media library"
    >
      <div className="flex h-full w-full max-w-[min(100vw,520px)] flex-col bg-white shadow-2xl sm:max-h-[min(100vh,900px)] sm:rounded-2xl sm:border sm:border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <Library className="h-5 w-5 text-slate-700" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Media Library</h2>
              <p className="text-xs text-slate-500">Indexed `OwnedMediaAsset` — no raw drive paths. TODO: ASR/AI clip search.</p>
            </div>
          </div>
          <button type="button" className="rounded-lg p-2 hover:bg-slate-100" onClick={() => onOpenChange(false)} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <UiScrollArea className="min-h-0 flex-1">
          <div className="space-y-4 p-4">
            {socialContentItemId ? (
              <Card className="rounded-2xl border-amber-200/80 bg-amber-50/30">
                <CardHeader className="py-2">
                  <CardTitle className="text-sm">Attached to this work item</CardTitle>
                  <CardDescription>Refs drive Author Studio, video, and variant picks.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {refs.length === 0 ? <p className="text-slate-500">None yet — attach below.</p> : null}
                  {refs.map((r) => (
                    <div key={r.refId} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-2">
                      <div>
                        <span className="font-medium">{r.media.title}</span>
                        <span className="ml-1 text-xs text-slate-500">({purposeLabel(r.purpose)})</span>
                      </div>
                      <UiButton
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 text-red-700"
                        onClick={() => {
                          start(async () => {
                            const d = await detachSocialMediaRefAction(r.refId);
                            if (d.ok) loadRefs();
                            else alert(d.error);
                          });
                        }}
                      >
                        Remove
                      </UiButton>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}

            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative min-w-0 flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                  <UiInput
                    className="rounded-xl pl-8"
                    placeholder="Search title, file, description…"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && runSearch()}
                  />
                </div>
                <UiButton type="button" className="rounded-xl" onClick={runSearch} disabled={pending}>
                  {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                </UiButton>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500">County</span>
                  <select
                    className="mt-0.5 flex h-10 w-full rounded-md border border-slate-200 bg-white px-2 text-sm"
                    value={countyId}
                    onChange={(e) => setCountyId(e.target.value)}
                  >
                    <option value="">All</option>
                    {countyOpts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.displayName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500">Event</span>
                  <select
                    className="mt-0.5 flex h-10 w-full rounded-md border border-slate-200 bg-white px-2 text-sm"
                    value={eventId}
                    onChange={(e) => setEventId(e.target.value)}
                  >
                    <option value="">All</option>
                    {eventOpts.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.title} ({new Date(e.startAt).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500">Kind</span>
                  <select
                    className="mt-0.5 flex h-10 w-full rounded-md border border-slate-200 bg-white px-2 text-sm"
                    aria-label="Kind"
                    value={kind}
                    onChange={(e) => setKind(e.target.value)}
                  >
                    <option value="">All kinds</option>
                    {Object.values(OwnedMediaKind).map((k) => (
                      <option key={k} value={k}>
                        {socialEnumLabel(k)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500">Approved for social</span>
                  <NativeSelect
                    className="mt-0.5 rounded-md"
                    aria-label="Approved"
                    value={approvedOnly}
                    onValueChange={(v) => setApprovedOnly(v as "" | "yes" | "no")}
                    options={[
                      { value: "", label: "Any" },
                      { value: "yes", label: "Yes" },
                      { value: "no", label: "No" },
                    ]}
                  />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500">Transcript</span>
                  <NativeSelect
                    className="mt-0.5 rounded-md"
                    value={transcript}
                    onValueChange={(v) => setTranscript(v as "" | "yes" | "no")}
                    options={[
                      { value: "", label: "Any" },
                      { value: "yes", label: "Has transcript" },
                      { value: "no", label: "No transcript" },
                    ]}
                  />
                </div>
                <div className="flex items-end gap-2">
                  <label className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-600">
                    <input type="checkbox" checked={sourceLocalIndexed} onChange={(e) => setSourceLocalIndexed(e.target.checked)} />
                    Local index only
                  </label>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500">Captured from</span>
                  <UiInput className="mt-0.5 rounded-md" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500">Captured to</span>
                  <UiInput className="mt-0.5 rounded-md" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                </div>
              </div>
              {platformVariants.length > 0 ? (
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500">Platform variant (for variant attach)</span>
                  <select
                    className="mt-0.5 flex h-10 w-full rounded-md border border-slate-200 bg-white px-2 text-sm"
                    value={variantId}
                    onChange={(e) => setVariantId(e.target.value)}
                  >
                    <option value="">— Select —</option>
                    {platformVariants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500">Note (optional)</span>
                <UiTextarea className="mt-0.5 min-h-[48px] rounded-md" value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
            </div>

            <p className="text-xs text-slate-500">
              {total} match(es). Results use preview route — never raw `storageKey` in the client.
            </p>

            <ul className="space-y-3">
              {items.map((m) => (
                <li key={m.id} className="flex gap-3 rounded-2xl border border-slate-200 p-2">
                  <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    {m.kind === "IMAGE" ? (
                      <img
                        src={m.previewUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <div className="text-sm font-semibold leading-tight text-slate-900">{m.title}</div>
                      {!m.approvedForSocial ? (
                        <span className="shrink-0 rounded border border-amber-400 bg-amber-100 px-1.5 text-[9px] font-bold uppercase text-amber-900">
                          Unapproved
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-0.5 text-[10px] text-slate-500">
                      {socialEnumLabel(m.kind)} · {m.fileName} · {socialEnumLabel(m.sourceType)}
                    </div>
                    {m.transcriptExcerpt ? (
                      <p className="mt-1 line-clamp-2 text-xs text-slate-600">“{m.transcriptExcerpt}”</p>
                    ) : null}
                    {m.hasTranscript && !m.transcriptExcerpt ? (
                      <p className="mt-0.5 text-[10px] text-emerald-700">Transcript on file (TODO: semantic search)</p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap gap-1">
                      <UiButton
                        type="button"
                        size="sm"
                        className="h-7 text-[10px]"
                        disabled={!socialContentItemId || attaching === m.id}
                        onClick={() => onAttach(m.id, SocialContentMediaRefPurpose.SOCIAL_PLAN)}
                      >
                        Attach
                      </UiButton>
                      <UiButton
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 text-[10px]"
                        disabled={!socialContentItemId || attaching === m.id}
                        onClick={() => onAttach(m.id, SocialContentMediaRefPurpose.VIDEO_REPURPOSE)}
                      >
                        Video
                      </UiButton>
                      <UiButton
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 text-[10px]"
                        disabled={!socialContentItemId || attaching === m.id}
                        onClick={() => onAttach(m.id, SocialContentMediaRefPurpose.VISUAL)}
                      >
                        Visual
                      </UiButton>
                      <UiButton
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 text-[10px]"
                        disabled={!socialContentItemId || !variantId || attaching === m.id}
                        onClick={() => onAttach(m.id, SocialContentMediaRefPurpose.PLATFORM_VARIANT)}
                      >
                        Variant
                      </UiButton>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </UiScrollArea>
      </div>
    </div>
  );
}
