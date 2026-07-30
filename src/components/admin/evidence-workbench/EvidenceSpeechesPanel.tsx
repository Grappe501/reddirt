"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  analyzeTranscriptIntelAction,
  applyTranscriptIntelAction,
  buildSpeechMetadataPacketAction,
  encodeVideoExcerptAction,
  extractVideoPosterAction,
  listLocalVideoMastersAction,
  listVideoClipsAction,
  planVideoExcerptAction,
  prepSpeechVideoPackageAction,
  proposeVideoEditProjectAction,
  listVideoEditProjectsAction,
  renderVideoEditProjectAction,
  updateVideoEditCutListAction,
  previewVideoEditCaptionsAction,
  softArchiveVideoAssembliesAction,
  probeLocalVideoAction,
  probeVideoToolingAction,
  saveSpeechEvidenceAction,
  suggestSpeechEvidenceAiAction,
} from "@/app/admin/evidence-workbench-actions";
import type { SpeechEvidenceOverlay } from "@/lib/campaign-media/evidence-types";
import type {
  VideoClipRecord,
  VideoExcerptPlan,
} from "@/lib/campaign-media/media-derivatives-types";
import type {
  VideoAssemblyRecord,
  VideoEditProject,
} from "@/lib/campaign-media/video-edit-types";
import type { VideoExportAspect } from "@/lib/campaign-media/video-look-presets";
import type { TranscriptIntelProposal } from "@/lib/campaign-media/transcript-intelligence";
import { mergeAiCountyIntoList } from "@/lib/campaign-media/evidence-validation";
import { EVIDENCE_FIELD_CLASS } from "@/components/admin/evidence-workbench/field-styles";
import { EvidenceAiModePanel } from "@/components/admin/evidence-workbench/EvidenceAiModePanel";
import { isEditableKeyboardTarget } from "@/components/admin/evidence-workbench/keyboard";
import type { EvidenceAiMode } from "@/lib/campaign-media/evidence-ai-modes";
import {
  ewChipClass,
  ewPanelClass,
  ewPanelTitleClass,
} from "@/components/admin/evidence-workbench/evidenceWorkbenchChrome";

type PrepPacketView = {
  message: string;
  master: { found: boolean; note: string };
  planError?: string;
  intelError?: string;
  nextActions: string[];
  planClips?: number;
  intelQuotes?: number;
};
const INTEL_FIELD_OPTIONS: Array<{ key: string; label: string }> = [
  { key: "whatThisProves", label: "What this proves" },
  { key: "speakerNotes", label: "Speaker notes" },
  { key: "keyQuotes", label: "Key quotes" },
  { key: "doNotClaim", label: "Do-not-claim" },
  { key: "transcriptChapters", label: "Chapters" },
];

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
  const [aiMode, setAiMode] = useState<EvidenceAiMode>("identify");
  const [ffmpegNote, setFfmpegNote] = useState("");
  const [posterAt, setPosterAt] = useState("1");
  const [posterSrc, setPosterSrc] = useState<string | null>(null);
  const [masterNote, setMasterNote] = useState("");
  const [excerptPlan, setExcerptPlan] = useState<VideoExcerptPlan | null>(null);
  const [encodedClips, setEncodedClips] = useState<VideoClipRecord[]>([]);
  const [encodeProgress, setEncodeProgress] = useState("");
  const [planQuery, setPlanQuery] = useState("");
  const [manualStart, setManualStart] = useState("0");
  const [manualEnd, setManualEnd] = useState("8");
  const [vertical916, setVertical916] = useState(false);
  const [prepAlsoEncode, setPrepAlsoEncode] = useState(false);
  const [prepAlsoPoster, setPrepAlsoPoster] = useState(false);
  const [prepPacket, setPrepPacket] = useState<PrepPacketView | null>(null);
  const [editProject, setEditProject] = useState<VideoEditProject | null>(null);
  const [assemblies, setAssemblies] = useState<VideoAssemblyRecord[]>([]);
  const [proLook, setProLook] = useState<"neutral" | "warm" | "cool" | "contrast">("neutral");
  const [proTransition, setProTransition] = useState<"none" | "crossfade">("crossfade");
  const [proCaptions, setProCaptions] = useState<"none" | "sidecar" | "burn_in">("sidecar");
  const [proAspects, setProAspects] = useState<VideoExportAspect[]>([
    "source",
    "vertical_9x16",
    "square_1x1",
  ]);
  const [proMaxClips, setProMaxClips] = useState(3);
  const [proLoudnorm, setProLoudnorm] = useState(true);
  const [proRenderNote, setProRenderNote] = useState("");
  const [captionPreview, setCaptionPreview] = useState<Array<{
    start: number;
    end: number;
    text: string;
  }> | null>(null);
  const [captionPreviewNote, setCaptionPreviewNote] = useState("");
  const [intelProposal, setIntelProposal] = useState<TranscriptIntelProposal | null>(null);
  const [intelFields, setIntelFields] = useState<Set<string>>(
    () => new Set(["whatThisProves", "keyQuotes", "doNotClaim", "transcriptChapters"]),
  );

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
    setPosterSrc(null);
    setMasterNote("");
    setExcerptPlan(null);
    setEncodedClips([]);
    setEncodeProgress("");
    setIntelProposal(null);
    setPrepPacket(null);
    setPlanQuery("");
    setEditProject(null);
    setAssemblies([]);
    setProRenderNote("");
    void probeVideoToolingAction().then((res) => {
      setFfmpegNote(res.message);
    });
    if (!speech) return;
    const speechId = speech.id;
    const youtubeVideoId = speech.youtubeVideoId;
    void listLocalVideoMastersAction().then((res) => {
      const hit = res.masters?.find(
        (m) =>
          m.filename.toLowerCase().includes(speechId.toLowerCase()) ||
          m.filename.toLowerCase().includes(youtubeVideoId.toLowerCase()),
      );
      setMasterNote(hit ? `Master: ${hit.filename} (${hit.root})` : res.message);
    });
    void listVideoClipsAction(speechId).then((res) => {
      setEncodedClips(res.clips ?? []);
    });
    void listVideoEditProjectsAction(speechId).then((res) => {
      setEditProject(res.projects?.[0] ?? null);
      setAssemblies(res.assemblies ?? []);
    });
  }, [speech?.id, speech?.youtubeVideoId]);

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
    const mode = aiMode;
    start(async () => {
      const res = await suggestSpeechEvidenceAiAction(speechId, mode);
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

  function planExcerpt() {
    const youtubeVideoId = speech.youtubeVideoId;
    const q = planQuery.trim();
    start(async () => {
      const res = await planVideoExcerptAction(youtubeVideoId, q || undefined);
      setMessage(res.message);
      if (res.ok && res.plan) setExcerptPlan(res.plan);
    });
  }

  function runVideoPrep() {
    const speechId = speech.id;
    const youtubeVideoId = speech.youtubeVideoId;
    start(async () => {
      const res = await prepSpeechVideoPackageAction({
        speechId,
        youtubeVideoId,
        query: planQuery.trim() || undefined,
        maxClips: 3,
        confirmEncode: prepAlsoEncode,
        confirmPoster: prepAlsoPoster,
        aspect: vertical916 ? "vertical_9x16" : "source",
      });
      setMessage(res.message);
      if (!res.packet) return;
      const p = res.packet;
      setPrepPacket({
        message: p.message,
        master: p.master,
        planError: p.planError,
        intelError: p.intelError,
        nextActions: p.nextActions,
        planClips: p.plan?.clips.length,
        intelQuotes: p.intel?.quotes.length,
      });
      if (p.plan) setExcerptPlan(p.plan);
      if (p.intel) setIntelProposal(p.intel);
      if (p.encodedThisRun.length || p.existingClips.length) {
        setEncodedClips(
          p.encodedThisRun.length
            ? [
                ...p.encodedThisRun,
                ...p.existingClips.filter((c) => !p.encodedThisRun.some((e) => e.id === c.id)),
              ]
            : p.existingClips,
        );
      }
      if (p.postersThisRun[0]) setPosterSrc(p.postersThisRun[0].publicSrc);
    });
  }

  function encodeManualWindow() {
    const startSec = Number(manualStart);
    const endSec = Number(manualEnd);
    if (!Number.isFinite(startSec) || !Number.isFinite(endSec) || endSec <= startSec) {
      setMessage("Manual window needs end > start.");
      return;
    }
    const speechId = speech.id;
    const youtubeVideoId = speech.youtubeVideoId;
    setEncodeProgress(`Encoding ${startSec}s–${endSec}s…`);
    start(async () => {
      const res = await encodeVideoExcerptAction({
        speechId,
        youtubeVideoId,
        startSeconds: startSec,
        endSeconds: endSec,
        title: "Manual window",
        aspect: vertical916 ? "vertical_9x16" : "source",
      });
      setMessage(res.message);
      setEncodeProgress("");
      const listed = await listVideoClipsAction(speechId);
      setEncodedClips(listed.clips ?? []);
    });
  }

  function encodeQuoteWindow(startSeconds: number, endSeconds: number, quote: string) {
    const speechId = speech.id;
    const youtubeVideoId = speech.youtubeVideoId;
    setEncodeProgress(`Encoding quote ${startSeconds}s–${endSeconds}s…`);
    start(async () => {
      const res = await encodeVideoExcerptAction({
        speechId,
        youtubeVideoId,
        startSeconds,
        endSeconds,
        title: quote.slice(0, 72),
        quote,
        aspect: vertical916 ? "vertical_9x16" : "source",
      });
      setMessage(res.message);
      setEncodeProgress("");
      const listed = await listVideoClipsAction(speechId);
      setEncodedClips(listed.clips ?? []);
    });
  }

  function encodeClip(clipIndex: number) {
    if (!excerptPlan) {
      setMessage("Plan video excerpts first, then encode.");
      return;
    }
    const speechId = speech.id;
    const youtubeVideoId = speech.youtubeVideoId;
    const clip = excerptPlan.clips[clipIndex];
    setEncodeProgress(`Encoding clip ${clipIndex + 1}…`);
    start(async () => {
      const res = await encodeVideoExcerptAction({
        speechId,
        youtubeVideoId,
        planId: excerptPlan.id,
        clipIndex,
        startSeconds: clip?.startSeconds,
        endSeconds: clip?.endSeconds,
        title: clip?.title,
        quote: clip?.quote,
        aspect: vertical916 ? "vertical_9x16" : "source",
      });
      setEncodeProgress("");
      setMessage(res.message);
      if (res.ok) {
        const listed = await listVideoClipsAction(speechId);
        setEncodedClips(listed.clips ?? []);
      }
    });
  }

  function encodeAllPlanned() {
    if (!excerptPlan?.clips.length) {
      setMessage("Plan video excerpts first, then encode.");
      return;
    }
    const speechId = speech.id;
    const youtubeVideoId = speech.youtubeVideoId;
    const planId = excerptPlan.id;
    setEncodeProgress(`Encoding up to ${Math.min(excerptPlan.clips.length, 4)} clips…`);
    start(async () => {
      const res = await encodeVideoExcerptAction({
        speechId,
        youtubeVideoId,
        planId,
        aspect: vertical916 ? "vertical_9x16" : "source",
      });
      setEncodeProgress("");
      setMessage(res.message);
      const listed = await listVideoClipsAction(speechId);
      setEncodedClips(listed.clips ?? []);
    });
  }

  function proposeProEdit() {
    const speechId = speech.id;
    const youtubeVideoId = speech.youtubeVideoId;
    const aspects = proAspects.length ? proAspects : (["source"] as VideoExportAspect[]);
    start(async () => {
      const res = await proposeVideoEditProjectAction({
        speechId,
        youtubeVideoId,
        planId: excerptPlan?.id,
        maxClips: proMaxClips,
        transition: proTransition,
        look: proLook,
        captionMode: proCaptions,
        exportAspects: aspects,
        loudnorm: proLoudnorm,
      });
      setMessage(res.message);
      setCaptionPreview(null);
      if (res.packet?.project) setEditProject(res.packet.project);
      if (res.packet?.warnings?.length) {
        setProRenderNote(res.packet.warnings.concat(res.packet.nextActions).join(" · "));
      } else if (res.packet?.nextActions?.length) {
        setProRenderNote(res.packet.nextActions.join(" · "));
      }
    });
  }

  function confirmProRender() {
    if (!editProject) {
      setMessage("Propose a Pro Edit project first.");
      return;
    }
    const projectId = editProject.id;
    const speechId = speech.id;
    setProRenderNote("Rendering assembly pack…");
    start(async () => {
      const res = await renderVideoEditProjectAction({ projectId, confirmRender: true });
      setMessage(res.message);
      setProRenderNote(
        [res.message, ...(res.warnings ?? [])].filter(Boolean).join(" · "),
      );
      if (res.assemblies?.length) setAssemblies(res.assemblies);
      const listed = await listVideoEditProjectsAction(speechId);
      setAssemblies(listed.assemblies ?? res.assemblies ?? []);
      setEditProject(listed.projects?.find((p) => p.id === projectId) ?? editProject);
    });
  }

  function applyCutListUpdate(
    updates: Parameters<typeof updateVideoEditCutListAction>[0]["updates"],
  ) {
    if (!editProject) return;
    const projectId = editProject.id;
    start(async () => {
      const res = await updateVideoEditCutListAction({ projectId, updates });
      setMessage(res.message);
      if (res.warnings?.length) setProRenderNote(res.warnings.join(" · "));
      if (res.ok && res.project) {
        setEditProject(res.project);
        setCaptionPreview(null);
      }
    });
  }

  function moveClip(clipId: string, dir: -1 | 1) {
    if (!editProject) return;
    const ids = editProject.clips.map((c) => c.id);
    const i = ids.indexOf(clipId);
    if (i < 0) return;
    const j = i + dir;
    if (j < 0 || j >= ids.length) return;
    const next = [...ids];
    const tmp = next[i];
    next[i] = next[j];
    next[j] = tmp;
    applyCutListUpdate([{ op: "reorder", clipIds: next }]);
  }

  function previewCaptions() {
    if (!editProject) {
      setMessage("Propose a Pro Edit project first.");
      return;
    }
    const projectId = editProject.id;
    start(async () => {
      const res = await previewVideoEditCaptionsAction({ projectId });
      setMessage(res.message);
      if (res.ok && res.cues) {
        setCaptionPreview(res.cues);
        setCaptionPreviewNote(res.previewNote ?? "");
      } else {
        setCaptionPreview(null);
        setCaptionPreviewNote(res.message);
      }
    });
  }

  function softArchiveAssemblies() {
    if (!editProject && !speech.id) return;
    start(async () => {
      const res = await softArchiveVideoAssembliesAction({
        projectId: editProject?.id,
        outId: speech.id,
        confirmArchive: true,
      });
      setMessage(res.message);
      setProRenderNote(res.message);
      const listed = await listVideoEditProjectsAction(speech.id);
      setAssemblies(listed.assemblies ?? []);
    });
  }

  function toggleProAspect(aspect: VideoExportAspect) {
    setProAspects((prev) => {
      if (prev.includes(aspect)) {
        const next = prev.filter((a) => a !== aspect);
        return next.length ? next : (["source"] as VideoExportAspect[]);
      }
      return [...prev, aspect];
    });
  }

  function syncProjectMeta() {
    if (!editProject) return;
    applyCutListUpdate([
      {
        op: "set_meta",
        look: proLook,
        transition: proTransition,
        captionMode: proCaptions,
        exportAspects: proAspects.length ? proAspects : ["source"],
        loudnorm: proLoudnorm,
      },
    ]);
  }

  function analyzeTranscript() {
    const speechId = speech.id;
    const youtubeVideoId = speech.youtubeVideoId;
    start(async () => {
      const res = await analyzeTranscriptIntelAction({ speechId, youtubeVideoId });
      setMessage(res.message);
      if (res.ok && res.proposal) setIntelProposal(res.proposal);
    });
  }

  function applyTranscriptIntel() {
    if (!intelProposal) {
      setMessage("Analyze transcript first.");
      return;
    }
    const fields = [...intelFields];
    if (!fields.length) {
      setMessage("Select at least one intel field to apply.");
      return;
    }
    const speechId = speech.id;
    start(async () => {
      const res = await applyTranscriptIntelAction({
        speechId,
        proposalId: intelProposal.id,
        applyFields: fields,
      });
      setMessage(res.message);
      if (res.ok && form && fields.includes("whatThisProves") && intelProposal.claimCandidates[0]) {
        setForm({
          ...form,
          whatThisProves: intelProposal.claimCandidates[0].text.slice(0, 500),
        });
      }
    });
  }

  function probeTooling() {
    start(async () => {
      const res = await probeVideoToolingAction();
      setFfmpegNote(res.message);
      setMessage(res.message);
    });
  }

  function probeMaster() {
    const speechId = speech.id;
    const youtubeVideoId = speech.youtubeVideoId;
    start(async () => {
      const res = await probeLocalVideoAction({ speechId, youtubeVideoId });
      setMessage(res.message);
    });
  }

  function extractPoster() {
    const speechId = speech.id;
    const youtubeVideoId = speech.youtubeVideoId;
    const at = Number(posterAt);
    start(async () => {
      const res = await extractVideoPosterAction({
        speechId,
        youtubeVideoId,
        atSeconds: Number.isFinite(at) ? at : 1,
      });
      setMessage(res.message);
      if (res.ok && res.publicSrc) setPosterSrc(res.publicSrc);
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
          <div className="mt-4 rounded-lg border-2 border-[#000066]/15 bg-white p-3">
            <p className="font-heading text-xs font-bold uppercase tracking-wide text-[#000066]">
              Video Prep (AI package)
            </p>
            <p className="mt-1 whitespace-pre-wrap font-body text-[11px] text-[#364272]">
              {ffmpegNote || "Checking ffmpeg…"}
            </p>
            <p className="mt-1 font-body text-[11px] text-[#364272]">{masterNote}</p>

            <label className="mt-2 block font-body text-[11px] font-semibold text-[#12124a]">
              Plan query (optional)
              <input
                className={`${EVIDENCE_FIELD_CLASS} mt-0.5`}
                value={planQuery}
                onChange={(e) => setPlanQuery(e.target.value)}
                placeholder="e.g. ballot access, county clerks"
              />
            </label>

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-body text-[11px] text-[#12124a]">
              <label className="inline-flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={vertical916}
                  onChange={(e) => setVertical916(e.target.checked)}
                />
                Encode as 9:16 social
              </label>
              <label className="inline-flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={prepAlsoEncode}
                  onChange={(e) => setPrepAlsoEncode(e.target.checked)}
                />
                Prep also encodes top 3
              </label>
              <label className="inline-flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={prepAlsoPoster}
                  onChange={(e) => setPrepAlsoPoster(e.target.checked)}
                />
                Prep also extracts poster
              </label>
            </div>

            <div className="mt-2 flex flex-wrap items-end gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={runVideoPrep}
                className="rounded border-2 border-[#000066] bg-[#000066] px-2.5 py-1 font-body text-xs font-bold text-white disabled:opacity-50"
              >
                Prep package
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={planExcerpt}
                className="rounded border-2 border-[#8eb6dc] bg-[#f4f7fc] px-2.5 py-1 font-body text-xs font-semibold text-[#12124a] disabled:opacity-50"
              >
                Plan excerpts
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={probeTooling}
                className="rounded border-2 border-[#8eb6dc] bg-[#f4f7fc] px-2.5 py-1 font-body text-xs font-semibold text-[#12124a] disabled:opacity-50"
              >
                Probe ffmpeg
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={probeMaster}
                className="rounded border-2 border-[#8eb6dc] bg-[#f4f7fc] px-2.5 py-1 font-body text-xs font-semibold text-[#12124a] disabled:opacity-50"
              >
                Probe local video
              </button>
              <label className="font-body text-[11px] text-[#12124a]">
                Poster @ sec
                <input
                  className={`${EVIDENCE_FIELD_CLASS} ml-1 w-16`}
                  value={posterAt}
                  onChange={(e) => setPosterAt(e.target.value)}
                />
              </label>
              <button
                type="button"
                disabled={pending}
                onClick={extractPoster}
                className="rounded border-2 border-[#ca913d] bg-white px-2.5 py-1 font-body text-xs font-semibold text-[#12124a] disabled:opacity-50"
              >
                Extract poster
              </button>
            </div>

            <div className="mt-2 flex flex-wrap items-end gap-2">
              <label className="font-body text-[11px] text-[#12124a]">
                Manual start
                <input
                  className={`${EVIDENCE_FIELD_CLASS} ml-1 w-16`}
                  value={manualStart}
                  onChange={(e) => setManualStart(e.target.value)}
                />
              </label>
              <label className="font-body text-[11px] text-[#12124a]">
                end
                <input
                  className={`${EVIDENCE_FIELD_CLASS} ml-1 w-16`}
                  value={manualEnd}
                  onChange={(e) => setManualEnd(e.target.value)}
                />
              </label>
              <button
                type="button"
                disabled={pending}
                onClick={encodeManualWindow}
                className="rounded border-2 border-[#ca913d] bg-white px-2.5 py-1 font-body text-xs font-semibold text-[#12124a] disabled:opacity-50"
              >
                Encode window
              </button>
            </div>

            {prepPacket ? (
              <div className="mt-3 rounded border border-[#8eb6dc]/40 bg-[#f4f7fc] p-2">
                <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-[#000066]">
                  Prep review
                </p>
                <p className="mt-1 font-body text-[11px] text-[#12124a]">{prepPacket.message}</p>
                <p className="font-body text-[11px] text-[#364272]">{prepPacket.master.note}</p>
                {prepPacket.planError ? (
                  <p className="font-body text-[11px] text-[#ca913d]">Plan: {prepPacket.planError}</p>
                ) : null}
                {prepPacket.intelError ? (
                  <p className="font-body text-[11px] text-[#ca913d]">Intel: {prepPacket.intelError}</p>
                ) : null}
                <p className="mt-1 font-body text-[11px] text-[#364272]">
                  {prepPacket.planClips != null ? `${prepPacket.planClips} planned · ` : ""}
                  {prepPacket.intelQuotes != null ? `${prepPacket.intelQuotes} quotes · ` : ""}
                  Next: {prepPacket.nextActions[0] ?? "—"}
                </p>
                {prepPacket.nextActions.length > 1 ? (
                  <ul className="mt-1 list-disc pl-4 font-body text-[10px] text-[#364272]">
                    {prepPacket.nextActions.slice(1, 5).map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}

            {posterSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={posterSrc}
                alt=""
                className="mt-2 max-h-48 w-full rounded border border-[#8eb6dc]/40 object-contain bg-[#f4f7fc]"
              />
            ) : null}

            {excerptPlan ? (
              <div className="mt-3 rounded border border-[#8eb6dc]/40 bg-[#f4f7fc] p-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-[#000066]">
                    Excerpt plan · {excerptPlan.clips.length} clips
                    {excerptPlan.query ? ` · “${excerptPlan.query}”` : ""}
                  </p>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={encodeAllPlanned}
                    className="rounded border-2 border-[#000066] bg-[#000066] px-2 py-0.5 font-body text-[10px] font-semibold text-white disabled:opacity-50"
                  >
                    Encode all (max 4)
                  </button>
                </div>
                {encodeProgress ? (
                  <p className="mt-1 font-body text-[11px] text-[#364272]">{encodeProgress}</p>
                ) : null}
                <ul className="mt-2 space-y-2">
                  {excerptPlan.clips.map((c, i) => (
                    <li
                      key={`${excerptPlan.id}-${i}`}
                      className="rounded border border-[#8eb6dc]/30 bg-white px-2 py-1.5"
                    >
                      <p className="font-body text-[11px] font-semibold text-[#12124a]">
                        {c.startSeconds}s–{c.endSeconds}s · {c.title}
                      </p>
                      <p className="font-body text-[10px] text-[#364272]">{c.reason}</p>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => encodeClip(i)}
                        className="mt-1 rounded border border-[#ca913d] bg-white px-2 py-0.5 font-body text-[10px] font-semibold text-[#12124a] disabled:opacity-50"
                      >
                        Encode clip
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {intelProposal?.quotes?.length ? (
              <div className="mt-3 rounded border border-[#8eb6dc]/40 bg-white p-2">
                <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-[#000066]">
                  Quote → encode
                </p>
                <ul className="mt-1 space-y-1.5">
                  {intelProposal.quotes.slice(0, 4).map((q, i) => (
                    <li key={`q-${i}`} className="flex flex-wrap items-start justify-between gap-2">
                      <p className="min-w-0 flex-1 font-body text-[10px] text-[#364272]">
                        {q.startSeconds}s–{q.endSeconds}s · {q.text.slice(0, 120)}
                      </p>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => encodeQuoteWindow(q.startSeconds, q.endSeconds, q.text)}
                        className="shrink-0 rounded border border-[#ca913d] bg-white px-2 py-0.5 font-body text-[10px] font-semibold text-[#12124a] disabled:opacity-50"
                      >
                        Encode quote
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {encodedClips.length ? (
              <div className="mt-3 space-y-2">
                <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-[#000066]">
                  Encoded clips
                </p>
                {encodedClips.map((c) => (
                  <div key={c.id} className="rounded border border-[#8eb6dc]/40 bg-white p-2">
                    <p className="font-body text-[11px] text-[#12124a]">
                      {c.startSeconds}s–{c.endSeconds}s
                      {c.title ? ` · ${c.title}` : ""}
                      {c.aspect === "vertical_9x16" ? " · 9:16" : ""}
                    </p>
                    <p className="break-all font-mono text-[10px] text-[#364272]">{c.publicSrc}</p>
                    <video
                      className="mt-1 max-h-40 w-full rounded bg-black"
                      controls
                      preload="metadata"
                      src={c.publicSrc}
                    />
                  </div>
                ))}
              </div>
            ) : null}

            <p className="mt-2 font-body text-[10px] text-[#364272]">
              Drop masters in public/media/campaign-video-masters/ or H:/SOSWebsite/.local/video-masters/
              (name includes speech id or YouTube id). Prep package = plan + intel review; encode only when you
              check the boxes or click Encode.
            </p>
          </div>

          <div className={`mt-4 ${ewPanelClass} !border-[#000066]/25`}>
            <p className={ewPanelTitleClass}>Pro Edit suite</p>
            <p className="mt-1 font-body text-[11px] text-[#364272]">
              World-class cut list → N-clip crossfade chain → look / loudnorm → SRT+VTT captions → multi-aspect
              pack. Propose first; edit times/order only (never invent lines); confirm render; soft-archive never
              deletes files.
            </p>

            <div className="mt-3 flex flex-wrap gap-3 font-body text-[11px] text-[#12124a]">
              <label className="inline-flex flex-col gap-0.5">
                Look
                <select
                  className={EVIDENCE_FIELD_CLASS}
                  value={proLook}
                  onChange={(e) =>
                    setProLook(e.target.value as "neutral" | "warm" | "cool" | "contrast")
                  }
                >
                  <option value="neutral">Neutral</option>
                  <option value="warm">Warm</option>
                  <option value="cool">Cool</option>
                  <option value="contrast">Contrast</option>
                </select>
              </label>
              <label className="inline-flex flex-col gap-0.5">
                Transition
                <select
                  className={EVIDENCE_FIELD_CLASS}
                  value={proTransition}
                  onChange={(e) => setProTransition(e.target.value as "none" | "crossfade")}
                >
                  <option value="crossfade">Crossfade (N clips)</option>
                  <option value="none">Hard cut</option>
                </select>
              </label>
              <label className="inline-flex flex-col gap-0.5">
                Captions
                <select
                  className={EVIDENCE_FIELD_CLASS}
                  value={proCaptions}
                  onChange={(e) =>
                    setProCaptions(e.target.value as "none" | "sidecar" | "burn_in")
                  }
                >
                  <option value="sidecar">Sidecar SRT+VTT</option>
                  <option value="burn_in">Burn-in</option>
                  <option value="none">None</option>
                </select>
              </label>
              <label className="inline-flex flex-col gap-0.5">
                Max clips
                <select
                  className={EVIDENCE_FIELD_CLASS}
                  value={String(proMaxClips)}
                  onChange={(e) => setProMaxClips(Number(e.target.value) || 3)}
                >
                  {[2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <label className="inline-flex items-end gap-2 pb-1">
                <input
                  type="checkbox"
                  checked={proLoudnorm}
                  onChange={(e) => setProLoudnorm(e.target.checked)}
                />
                Loudnorm
              </label>
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {(
                [
                  ["source", "Source"],
                  ["vertical_9x16", "9:16"],
                  ["square_1x1", "1:1"],
                  ["landscape_16x9", "16:9"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleProAspect(id)}
                  className={`${ewChipClass} cursor-pointer ${
                    proAspects.includes(id) ? "!border-[#000066] !bg-[#000066]/10 font-semibold" : ""
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={proposeProEdit}
                className="rounded border-2 border-[#000066] bg-[#000066] px-2.5 py-1 font-body text-xs font-bold text-white disabled:opacity-50"
              >
                Propose cut list
              </button>
              <button
                type="button"
                disabled={pending || !editProject}
                onClick={syncProjectMeta}
                className="rounded border border-[#8eb6dc] bg-white px-2.5 py-1 font-body text-xs font-semibold text-[#12124a] disabled:opacity-50"
              >
                Apply look / aspects
              </button>
              <button
                type="button"
                disabled={pending || !editProject}
                onClick={previewCaptions}
                className="rounded border border-[#8eb6dc] bg-white px-2.5 py-1 font-body text-xs font-semibold text-[#12124a] disabled:opacity-50"
              >
                Preview captions
              </button>
              <button
                type="button"
                disabled={pending || !editProject}
                onClick={confirmProRender}
                className="rounded border-2 border-[#ca913d] bg-white px-2.5 py-1 font-body text-xs font-semibold text-[#12124a] disabled:opacity-50"
              >
                Confirm render
              </button>
              <button
                type="button"
                disabled={pending || !assemblies.length}
                onClick={softArchiveAssemblies}
                className="rounded border border-[#8eb6dc]/60 bg-[#f4f7fc] px-2.5 py-1 font-body text-xs text-[#364272] disabled:opacity-50"
              >
                Soft-archive assemblies
              </button>
            </div>

            {proRenderNote ? (
              <p className="mt-2 font-body text-[11px] text-[#364272]">{proRenderNote}</p>
            ) : null}

            {editProject ? (
              <div className="mt-3 rounded border border-[#8eb6dc]/40 bg-[#f4f7fc] p-2">
                <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-[#000066]">
                  Cut list · {editProject.clips.length} clips · {editProject.title}
                </p>
                <p className="mt-1 font-body text-[11px] text-[#12124a]">
                  {editProject.look} · {editProject.transition}
                  {editProject.transition === "crossfade" && editProject.clips.length >= 2
                    ? ` (chain ×${editProject.clips.length})`
                    : ""}{" "}
                  · captions {editProject.captionMode}
                  {editProject.loudnorm ? " · loudnorm" : ""} · aspects{" "}
                  {editProject.exportAspects.join(", ")}
                </p>
                {editProject.directorRationale ? (
                  <p className="mt-1 font-body text-[10px] text-[#364272]">{editProject.directorRationale}</p>
                ) : null}
                <ul className="mt-2 space-y-1.5">
                  {editProject.clips.map((clip, i) => (
                    <li
                      key={clip.id || `${editProject.id}-clip-${i}`}
                      className="rounded border border-[#8eb6dc]/30 bg-white px-2 py-1.5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-body text-[11px] font-semibold text-[#12124a]">
                            #{i + 1}
                            {clip.title ? ` · ${clip.title}` : ""}
                          </p>
                          {clip.quote ? (
                            <p className="mt-0.5 font-body text-[10px] text-[#364272]">
                              {clip.quote.slice(0, 160)}
                            </p>
                          ) : null}
                          <div className="mt-1.5 flex flex-wrap items-center gap-2 font-body text-[10px]">
                            <label className="inline-flex items-center gap-1">
                              Start
                              <input
                                className={`${EVIDENCE_FIELD_CLASS} !mt-0 w-16 !py-0.5`}
                                type="number"
                                step="0.1"
                                min={0}
                                defaultValue={clip.startSeconds}
                                key={`${clip.id}-s-${clip.startSeconds}`}
                                onBlur={(e) => {
                                  const v = Number(e.target.value);
                                  if (!Number.isFinite(v) || v === clip.startSeconds) return;
                                  applyCutListUpdate([
                                    { op: "trim", clipId: clip.id, startSeconds: v },
                                  ]);
                                }}
                              />
                            </label>
                            <label className="inline-flex items-center gap-1">
                              End
                              <input
                                className={`${EVIDENCE_FIELD_CLASS} !mt-0 w-16 !py-0.5`}
                                type="number"
                                step="0.1"
                                min={0}
                                defaultValue={clip.endSeconds}
                                key={`${clip.id}-e-${clip.endSeconds}`}
                                onBlur={(e) => {
                                  const v = Number(e.target.value);
                                  if (!Number.isFinite(v) || v === clip.endSeconds) return;
                                  applyCutListUpdate([
                                    { op: "trim", clipId: clip.id, endSeconds: v },
                                  ]);
                                }}
                              />
                            </label>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            disabled={pending || i === 0}
                            onClick={() => moveClip(clip.id, -1)}
                            className="rounded border border-[#8eb6dc] px-1.5 py-0.5 text-[10px] disabled:opacity-40"
                            title="Move up"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            disabled={pending || i === editProject.clips.length - 1}
                            onClick={() => moveClip(clip.id, 1)}
                            className="rounded border border-[#8eb6dc] px-1.5 py-0.5 text-[10px] disabled:opacity-40"
                            title="Move down"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => applyCutListUpdate([{ op: "remove", clipId: clip.id }])}
                            className="rounded border border-[#c45c5c]/40 px-1.5 py-0.5 text-[10px] text-[#8a3030]"
                            title="Drop clip"
                          >
                            Drop
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {captionPreviewNote || captionPreview ? (
              <div className="mt-3 rounded border border-[#8eb6dc]/40 bg-white p-2">
                <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-[#000066]">
                  Caption preview
                </p>
                {captionPreviewNote ? (
                  <p className="mt-1 font-body text-[10px] text-[#364272]">{captionPreviewNote}</p>
                ) : null}
                {captionPreview?.length ? (
                  <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto">
                    {captionPreview.map((c, i) => (
                      <li key={`cap-${i}`} className="font-body text-[10px] text-[#12124a]">
                        <span className="font-mono text-[#364272]">
                          {c.start.toFixed(1)}–{c.end.toFixed(1)}
                        </span>{" "}
                        {c.text.slice(0, 120)}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}

            {assemblies.length ? (
              <div className="mt-3 space-y-2">
                <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-[#000066]">
                  Assemblies
                </p>
                {assemblies.map((a) => (
                  <div key={a.id} className="rounded border border-[#8eb6dc]/40 bg-white p-2">
                    <p className="font-body text-[11px] text-[#12124a]">
                      {a.aspect}
                      {a.look ? ` · ${a.look}` : ""}
                      {a.captionMode && a.captionMode !== "none" ? ` · ${a.captionMode}` : ""}
                      {a.note?.includes("[archived") ? " · archived" : ""}
                    </p>
                    <p className="break-all font-mono text-[10px] text-[#364272]">{a.publicSrc}</p>
                    {!a.note?.includes("[archived") ? (
                      <video
                        className="mt-1 max-h-40 w-full rounded bg-black"
                        controls
                        preload="metadata"
                        src={a.publicSrc}
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}

            <p className="mt-2 font-body text-[10px] text-[#364272]">
              Requires encoded clips (or a plan + master). Crossfade chains all N clips (fallback to hard cut).
              Captions are verbatim from workspace transcript windows only — SRT and VTT written together on
              sidecar mode.
            </p>
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
          <div className="space-y-2">
            <EvidenceAiModePanel kind="video" mode={aiMode} onChange={setAiMode} />
            <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={suggestAi}
              className="rounded-md border-2 border-[#000066] bg-white px-4 py-2 font-body text-sm font-bold text-[#000066] disabled:opacity-50"
            >
            Suggest with AI ({aiMode})
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
            <button
              type="button"
              disabled={pending}
              onClick={planExcerpt}
              className="rounded-md border-2 border-[#8eb6dc] bg-white px-4 py-2 font-body text-sm font-semibold text-[#12124a] disabled:opacity-50"
            >
              Plan video excerpts
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={analyzeTranscript}
              className="rounded-md border-2 border-[#ca913d] bg-white px-4 py-2 font-body text-sm font-semibold text-[#12124a] disabled:opacity-50"
            >
              Analyze transcript (Pass 8)
            </button>
            </div>
          </div>

          {intelProposal ? (
            <div className="rounded-lg border-2 border-[#ca913d]/40 bg-[#fff8ef] p-3">
              <p className="font-heading text-xs font-bold uppercase tracking-wide text-[#000066]">
                Transcript intelligence · review then apply
              </p>
              <p className="mt-1 font-body text-[11px] text-[#364272]">
                {intelProposal.grounding.segmentCount} segments · {intelProposal.grounding.status} ·{" "}
                {intelProposal.grounding.charCount} chars
                {intelProposal.warnings.length ? ` · ${intelProposal.warnings.join("; ")}` : ""}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-body text-[11px] text-[#12124a]">
                {INTEL_FIELD_OPTIONS.map((f) => (
                  <label key={f.key} className="inline-flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={intelFields.has(f.key)}
                      onChange={(e) => {
                        setIntelFields((prev) => {
                          const next = new Set(prev);
                          if (e.target.checked) next.add(f.key);
                          else next.delete(f.key);
                          return next;
                        });
                      }}
                    />
                    {f.label}
                  </label>
                ))}
              </div>
              <button
                type="button"
                disabled={pending}
                onClick={applyTranscriptIntel}
                className="mt-2 rounded border-2 border-[#000066] bg-[#000066] px-3 py-1 font-body text-xs font-semibold text-white disabled:opacity-50"
              >
                Apply selected to speech evidence
              </button>
              {intelProposal.chapters.length ? (
                <div className="mt-2">
                  <p className="font-heading text-[10px] font-bold uppercase text-[#000066]">Chapters</p>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4 font-body text-[11px] text-[#364272]">
                    {intelProposal.chapters.slice(0, 6).map((c) => (
                      <li key={c.id}>
                        {c.startSeconds}s — {c.title}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {intelProposal.quotes.length ? (
                <div className="mt-2">
                  <p className="font-heading text-[10px] font-bold uppercase text-[#000066]">Quotes</p>
                  <ul className="mt-1 space-y-1 font-body text-[11px] text-[#364272]">
                    {intelProposal.quotes.slice(0, 4).map((q, i) => (
                      <li key={`${q.startSeconds}-${i}`} className="rounded border border-[#8eb6dc]/30 bg-white px-2 py-1">
                        “{q.text}”
                        <span className="block font-mono text-[10px]">
                          {q.startSeconds}s–{q.endSeconds}s
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {intelProposal.doNotClaim.length ? (
                <div className="mt-2">
                  <p className="font-heading text-[10px] font-bold uppercase text-[#000066]">Do not claim</p>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4 font-body text-[11px] text-[#364272]">
                    {intelProposal.doNotClaim.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}

          {speech.overlay?.doNotClaim?.length || speech.overlay?.keyQuotes?.length ? (
            <div className="rounded border border-[#8eb6dc]/40 bg-[#f4f7fc] p-2 font-body text-[11px] text-[#364272]">
              {speech.overlay.keyQuotes?.length ? (
                <p>
                  <span className="font-semibold text-[#12124a]">Saved quotes:</span>{" "}
                  {speech.overlay.keyQuotes.length}
                </p>
              ) : null}
              {speech.overlay.doNotClaim?.length ? (
                <ul className="mt-1 list-disc pl-4">
                  {speech.overlay.doNotClaim.slice(0, 4).map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          {message ? (
            <p className="whitespace-pre-wrap font-body text-sm text-[#364272]">{message}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
