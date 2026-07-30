/**
 * Evidence AI modes — tool subsets + prompt extras (audit #5).
 * Modes shrink the ~40-tool God surface into closed-loop assists.
 */

export const EVIDENCE_AI_MODES = [
  "identify",
  "fit",
  "photo_prep",
  "video_prep",
  "publish",
  "general",
] as const;

export type EvidenceAiMode = (typeof EVIDENCE_AI_MODES)[number];

export type EvidenceAiModeMeta = {
  id: EvidenceAiMode;
  label: string;
  kind: "photo" | "video" | "both";
  summary: string;
  /** Higher rounds for prep/publish loops. */
  maxToolRounds: number;
};

export const EVIDENCE_AI_MODE_META: EvidenceAiModeMeta[] = [
  {
    id: "identify",
    label: "Identify",
    kind: "both",
    summary: "County / city / venue / event / proof — Prefer Unknown.",
    maxToolRounds: 4,
  },
  {
    id: "fit",
    label: "Fit",
    kind: "both",
    summary: "Where this asset fits on the site (surfaces, placement propose).",
    maxToolRounds: 4,
  },
  {
    id: "photo_prep",
    label: "Photo prep",
    kind: "photo",
    summary: "Crops, derivatives, focus, Photo Pro Edit (no silent promote).",
    maxToolRounds: 5,
  },
  {
    id: "video_prep",
    label: "Video prep",
    kind: "video",
    summary: "Masters, excerpts, transcript intel, Video Pro Edit (gated encode/render).",
    maxToolRounds: 5,
  },
  {
    id: "publish",
    label: "Publish",
    kind: "both",
    summary: "Queue, batch flags, ship checklist, curated placement (confirm required).",
    maxToolRounds: 4,
  },
  {
    id: "general",
    label: "General",
    kind: "both",
    summary: "Full tool surface for this asset kind (legacy God mode).",
    maxToolRounds: 4,
  },
];

const GROUNDING = [
  "lookup_arkansas_county",
  "search_confirmed_memory",
  "search_calendar_presence",
] as const;

const PHOTO_IDENTIFY = [
  ...GROUNDING,
  "find_similar_campaign_photos",
  "get_photo_file_basics",
  "inspect_photo_pixels",
  "cluster_photo_selection",
  "get_photo_intake_status",
  "get_county_album_summary",
  "turbo_ingest_photos",
  "apply_turbo_proposal",
  "get_evidence_publish_queue",
] as const;

const PHOTO_FIT = [
  ...GROUNDING,
  "get_website_surface_inventory",
  "score_photo_website_fit",
  "preview_placement_rules",
  "get_county_album_summary",
  "propose_curated_placement",
  "list_curated_placement_proposals",
  "write_curated_placement_stub",
  "list_photo_derivatives",
] as const;

const PHOTO_PREP = [
  "get_photo_file_basics",
  "inspect_photo_pixels",
  "suggest_crop_plan",
  "create_photo_derivative",
  "list_photo_derivatives",
  "batch_create_photo_derivatives",
  "create_focus_crop",
  "create_derivative_from_crop_advice",
  "propose_photo_edit_project",
  "render_photo_edit_project",
  "list_photo_assemblies",
  "search_confirmed_memory",
] as const;

const PHOTO_PUBLISH = [
  ...GROUNDING,
  "get_evidence_publish_queue",
  "run_publish_queue_turbo",
  "refresh_evidence_density_snapshot",
  "batch_apply_photo_evidence",
  "batch_publish_photo_flags",
  "undo_batch_publish",
  "list_evidence_batch_ops",
  "promote_photo_derivative",
  "build_evidence_ship_report",
  "write_registry_graduation_stub",
  "propose_curated_placement",
  "apply_curated_placement",
  "list_curated_placement_proposals",
  "write_curated_placement_stub",
  "undo_curated_placement",
  "get_website_surface_inventory",
] as const;

const VIDEO_IDENTIFY = [
  ...GROUNDING,
  "search_campaign_speeches",
  "get_speech_registry_record",
  "get_video_transcript_excerpt",
  "analyze_transcript_intelligence",
  "get_speech_readiness_matrix",
] as const;

const VIDEO_FIT = [
  ...GROUNDING,
  "get_website_surface_inventory",
  "get_speech_confirm_queue",
  "get_speech_readiness_matrix",
  "propose_speech_placement",
  "search_campaign_speeches",
  "get_speech_registry_record",
] as const;

const VIDEO_PREP = [
  "probe_video_tooling",
  "probe_local_video",
  "prep_video_package",
  "plan_video_excerpt",
  "get_video_transcript_excerpt",
  "analyze_transcript_intelligence",
  "apply_transcript_intelligence",
  "extract_video_poster",
  "encode_video_excerpt",
  "list_video_derivatives",
  "propose_video_edit_project",
  "render_video_edit_project",
  "list_video_assemblies",
  "get_speech_readiness_matrix",
  "search_confirmed_memory",
] as const;

const VIDEO_PUBLISH = [
  ...GROUNDING,
  "get_speech_confirm_queue",
  "get_speech_readiness_matrix",
  "batch_save_speech_evidence",
  "batch_publish_speech_flags",
  "undo_batch_speech_publish",
  "propose_speech_placement",
  "apply_speech_placement",
  "get_website_surface_inventory",
] as const;

export function parseEvidenceAiMode(raw: unknown): EvidenceAiMode {
  const s = String(raw ?? "").trim().toLowerCase();
  if ((EVIDENCE_AI_MODES as readonly string[]).includes(s)) return s as EvidenceAiMode;
  return "identify";
}

export function modesForKind(kind: "photo" | "video"): EvidenceAiModeMeta[] {
  return EVIDENCE_AI_MODE_META.filter(
    (m) => m.kind === "both" || m.kind === kind || m.id === "general",
  ).filter((m) => {
    if (kind === "photo" && m.id === "video_prep") return false;
    if (kind === "video" && m.id === "photo_prep") return false;
    return true;
  });
}

export function toolNamesForMode(
  kind: "photo" | "video",
  mode: EvidenceAiMode,
): ReadonlySet<string> | null {
  if (mode === "general") return null;
  if (kind === "photo") {
    switch (mode) {
      case "identify":
        return new Set(PHOTO_IDENTIFY);
      case "fit":
        return new Set(PHOTO_FIT);
      case "photo_prep":
        return new Set(PHOTO_PREP);
      case "publish":
        return new Set(PHOTO_PUBLISH);
      case "video_prep":
        return new Set(PHOTO_IDENTIFY);
      default:
        return new Set(PHOTO_IDENTIFY);
    }
  }
  switch (mode) {
    case "identify":
      return new Set(VIDEO_IDENTIFY);
    case "fit":
      return new Set(VIDEO_FIT);
    case "video_prep":
      return new Set(VIDEO_PREP);
    case "publish":
      return new Set(VIDEO_PUBLISH);
    case "photo_prep":
      return new Set(VIDEO_IDENTIFY);
    default:
      return new Set(VIDEO_IDENTIFY);
  }
}

export function systemExtraForMode(mode: EvidenceAiMode): string {
  switch (mode) {
    case "identify":
      return `MODE identify: Focus on geography + event + whatThisProves. Prefer Unknown. Call lookup_arkansas_county before asserting a county. Do not create derivatives, encode video, publish, or mutate curated IDs.`;
    case "fit":
      return `MODE fit: Rank website surfaces / placement only. Prefer score_photo_website_fit or speech readiness/placement tools. Do not invent geography. Do not Approve/Publish or encode/render. Propose curated placement only when asked; never apply without confirm.`;
    case "photo_prep":
      return `MODE photo_prep: Crops and non-destructive derivatives / Pro Edit only. Prefer suggest_crop_plan before create_photo_derivative. Never promote or Approve. Only render_photo_edit_project with confirmRender:true when operator asks.`;
    case "video_prep":
      return `MODE video_prep: Prep package, excerpts, transcript intel, Pro Edit only. Prefer prep_video_package / plan_video_excerpt. Never invent spoken lines. Only encode/render with explicit confirmEncode/confirmRender.`;
    case "publish":
      return `MODE publish: Queue, batch flags, ship, curated placement. Never invent geography. Never silent Approve — only batch_publish_* when operator explicitly asks. confirmCurate required for placement apply. Prefer get_evidence_publish_queue / get_speech_confirm_queue first.`;
    case "general":
      return `MODE general: Full tool surface for this asset kind. Still Prefer Unknown; still honor all confirm* gates.`;
    default:
      return "";
  }
}

export function modeMeta(mode: EvidenceAiMode): EvidenceAiModeMeta {
  return EVIDENCE_AI_MODE_META.find((m) => m.id === mode) ?? EVIDENCE_AI_MODE_META[0];
}

/** Operator next-step hints for workbench mode sections (links are relative). */
export function modeNextSteps(
  kind: "photo" | "video",
  mode: EvidenceAiMode,
): Array<{ label: string; href?: string }> {
  switch (mode) {
    case "identify":
      return kind === "photo"
        ? [
            { label: "Publish Queue → Unknown", href: "/admin/evidence-workbench?tab=queue&filter=unknown" },
            { label: "Suggest → review → Save county (Unknown stays Unknown)" },
            { label: "Optional: Turbo Identify on backlog (confirm)" },
          ]
        : [
            { label: "Videos confirm → no-county", href: "/admin/evidence-workbench?tab=speeches" },
            { label: "Suggest → Save counties / proof" },
          ];
    case "fit":
      return kind === "photo"
        ? [
            { label: "Score website surfaces (Suggest in Fit)" },
            { label: "Placement tab for HOMEPAGE_* propose", href: "/admin/evidence-workbench?tab=placement" },
          ]
        : [
            { label: "Speech readiness / confirm queue" },
            { label: "Homepage video placement propose on Videos tab" },
          ];
    case "photo_prep":
      return [
        { label: "Crop plan → derivatives / focus crops on this still" },
        { label: "Photo Pro Edit propose → Confirm render (never auto-promote)" },
      ];
    case "video_prep":
      return [
        { label: "Prep package / plan excerpts / transcript intel" },
        { label: "Pro Edit propose → Confirm render (gated encode)" },
      ];
    case "publish":
      return [
        { label: "Publish Queue", href: "/admin/evidence-workbench?tab=queue" },
        { label: "Ship checklist", href: "/admin/evidence-workbench?tab=ship" },
        { label: "Batch Approve/Publish only when operator confirms" },
      ];
    case "general":
      return [
        { label: "Full tool surface — prefer a closed mode when possible" },
        { label: "All confirm* gates still apply" },
      ];
    default:
      return [];
  }
}

/** Client-safe catalog of modes for workbench UI. */
export function listEvidenceAiModesForUi(kind: "photo" | "video"): Array<{
  id: EvidenceAiMode;
  label: string;
  summary: string;
  toolCount: number | "all";
}> {
  return modesForKind(kind).map((m) => {
    const names = toolNamesForMode(kind, m.id);
    return {
      id: m.id,
      label: m.label,
      summary: m.summary,
      toolCount: names ? names.size : "all",
    };
  });
}
