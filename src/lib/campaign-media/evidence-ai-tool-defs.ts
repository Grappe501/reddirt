/**
 * OpenAI tool schemas for the Evidence Workbench brain.
 * Executors live in evidence-ai-tool-runtime.ts (server-only).
 */

import type { ChatCompletionTool } from "openai/resources/chat/completions";
import {
  type EvidenceAiMode,
  toolNamesForMode,
} from "@/lib/campaign-media/evidence-ai-modes";

export const EVIDENCE_AI_TOOL_CATALOG: Array<{
  name: string;
  audience: "photo" | "video" | "both";
  summary: string;
}> = [
  {
    name: "lookup_arkansas_county",
    audience: "both",
    summary: "Validate a county / city label against the 75-county Arkansas registry.",
  },
  {
    name: "search_confirmed_memory",
    audience: "both",
    summary: "Search Steve-confirmed evidence examples (soft priors only).",
  },
  {
    name: "search_calendar_presence",
    audience: "both",
    summary: "Find calendar presence rows by county, city, date fragment, or event text.",
  },
  {
    name: "rank_evidence_next_actions",
    audience: "both",
    summary: "Rank the next operator clicks from publish queue, speeches, calendar, ship, intake.",
  },
  {
    name: "propose_event_night_pack",
    audience: "both",
    summary: "Link a calendar row to cue-aligned photos + speeches — never invent matches.",
  },
  {
    name: "suggest_calendar_presence_fields",
    audience: "both",
    summary: "Propose calendar city/county/status from ICS text (Needs confirm only — Prefer Unknown).",
  },
  {
    name: "find_similar_campaign_photos",
    audience: "photo",
    summary: "Find registry photos with similar county, event, filename, or caption cues.",
  },
  {
    name: "get_photo_file_basics",
    audience: "photo",
    summary: "Read local file basics (exists, size, dimensions, orientation) for the current still.",
  },
  {
    name: "inspect_photo_pixels",
    audience: "photo",
    summary: "Sharp pixel inspect: real width/height, format, EXIF orientation, aspect class.",
  },
  {
    name: "suggest_crop_plan",
    audience: "photo",
    summary: "Recommend non-destructive crop/derivative kinds from source aspect ratio.",
  },
  {
    name: "create_photo_derivative",
    audience: "photo",
    summary: "Write a non-destructive derivative (web/thumb/hero/portrait/square/auto-orient).",
  },
  {
    name: "list_photo_derivatives",
    audience: "photo",
    summary: "List existing local derivatives for a photo id.",
  },
  {
    name: "batch_apply_photo_evidence",
    audience: "photo",
    summary: "Apply selected evidence fields to many photo ids at once (local write).",
  },
  {
    name: "batch_publish_photo_flags",
    audience: "photo",
    summary: "Batch approve/hold/homepage/featured flags (consent-aware; refreshes albums once).",
  },
  {
    name: "undo_batch_publish",
    audience: "photo",
    summary: "Undo the latest (or named) batch publish run using before-snapshots.",
  },
  {
    name: "list_evidence_batch_ops",
    audience: "photo",
    summary: "List recent batch publish + derivative operations (history).",
  },
  {
    name: "get_photo_intake_status",
    audience: "photo",
    summary: "Read intake pipeline status: new on disk, queue size, next step.",
  },
  {
    name: "intake_all_photos",
    audience: "photo",
    summary: "Flatten nested campaign-photos copies and queue all new stills into drafts (operator-intent).",
  },
  {
    name: "cluster_photo_selection",
    audience: "photo",
    summary: "Cluster selected photo ids by shared event/date/county cues (read-only).",
  },
  {
    name: "batch_create_photo_derivatives",
    audience: "photo",
    summary: "Create non-destructive web/thumb/hero/square derivatives for many photo ids.",
  },
  {
    name: "promote_photo_derivative",
    audience: "photo",
    summary: "Promote a derivative as public src override and/or homepage/hero placement flags.",
  },
  {
    name: "create_focus_crop",
    audience: "photo",
    summary: "Create a focus-point crop (hero/portrait/square) using normalized focusX/focusY.",
  },
  {
    name: "create_derivative_from_crop_advice",
    audience: "photo",
    summary: "Map cropAdvice text to a focus crop kind and write a derivative.",
  },
  {
    name: "get_county_album_summary",
    audience: "photo",
    summary: "Summarize existing county → event album chapters for a confirmed county.",
  },
  {
    name: "preview_placement_rules",
    audience: "photo",
    summary: "Explain which public surfaces a photo would hit given proposed flags.",
  },
  {
    name: "get_video_transcript_excerpt",
    audience: "video",
    summary: "Pull a local transcript excerpt for a YouTube id when the workspace has one.",
  },
  {
    name: "search_campaign_speeches",
    audience: "video",
    summary: "Search the speech/video registry by title, topic, county, or youtube id.",
  },
  {
    name: "get_speech_registry_record",
    audience: "video",
    summary: "Load one speech registry row (title, counties, topics, transcript status).",
  },
  {
    name: "probe_video_tooling",
    audience: "video",
    summary: "Report whether local ffmpeg/ffprobe are available for encode/poster ops.",
  },
  {
    name: "probe_local_video",
    audience: "video",
    summary: "ffprobe a local video master (duration/codecs) and optional clip window bounds.",
  },
  {
    name: "extract_video_poster",
    audience: "video",
    summary: "Extract a poster still from a local video master via ffmpeg (non-destructive).",
  },
  {
    name: "encode_video_excerpt",
    audience: "video",
    summary: "Encode a timed clip from a local master (from plan index or start/end seconds).",
  },
  {
    name: "analyze_transcript_intelligence",
    audience: "video",
    summary: "Local chapters/quotes/claims/do-not-claim from transcript workspace (no inventing).",
  },
  {
    name: "plan_video_excerpt",
    audience: "video",
    summary: "Build timed clip candidates from the local transcript workspace (no encode yet).",
  },
  {
    name: "prep_video_package",
    audience: "video",
    summary: "One-shot video prep: tooling + master + plan + transcript intel (encode/poster only with confirm flags).",
  },
  {
    name: "list_video_derivatives",
    audience: "video",
    summary: "List encoded clips and posters for a speech/outId.",
  },
  {
    name: "apply_transcript_intelligence",
    audience: "video",
    summary: "Apply a stored transcript-intel proposal to speech overlay fields (confirm required).",
  },
  {
    name: "get_website_surface_inventory",
    audience: "both",
    summary: "Live website surface inventory: homepage, albums, Across Arkansas, gaps.",
  },
  {
    name: "score_photo_website_fit",
    audience: "photo",
    summary: "Rank where a photo would fit on the site (homepage, journey, albums, From the Road).",
  },
  {
    name: "turbo_ingest_photos",
    audience: "photo",
    summary: "Intake (optional) + identify + website-fit proposals for draft/unknown stills (confirm required).",
  },
  {
    name: "apply_turbo_proposal",
    audience: "photo",
    summary: "Apply turbo identify and/or fit flags to overlay (confirm required; never silent Approve).",
  },
  {
    name: "propose_photo_edit_project",
    audience: "photo",
    summary: "Photo Edit Director: look + focus-aware multi-aspect export pack (no silent render).",
  },
  {
    name: "update_photo_edit_project",
    audience: "photo",
    summary: "Mutate Pro Edit look / slots / focus after propose (never silent-renders).",
  },
  {
    name: "preview_photo_edit_pack",
    audience: "photo",
    summary: "Cheap graded single-slot preview JPEG before Confirm render (never promotes).",
  },
  {
    name: "soft_archive_photo_assemblies",
    audience: "photo",
    summary: "Soft-archive Pro Edit assemblies (confirmArchive) — files never deleted.",
  },
  {
    name: "get_photo_readiness_matrix",
    audience: "photo",
    summary: "Rank stills by focus / Pro Edit / promote readiness (Prefer Unknown).",
  },
  {
    name: "render_photo_edit_project",
    audience: "photo",
    summary: "Confirm-render a Photo Pro Edit project: graded multi-aspect assembly pack + ledger bridge.",
  },
  {
    name: "list_photo_assemblies",
    audience: "photo",
    summary: "List Photo Pro Edit assemblies for a photoId.",
  },
  {
    name: "get_evidence_publish_queue",
    audience: "photo",
    summary: "Live Unknown/Draft/Needs-approval/Approved publish queue + next actions.",
  },
  {
    name: "refresh_evidence_density_snapshot",
    audience: "photo",
    summary: "Write density snapshot JSON and update EVIDENCE_DENSITY live Unknown/counties.",
  },
  {
    name: "run_publish_queue_turbo",
    audience: "photo",
    summary: "Turbo Identify+Fit on Unknown/draft backlog only (confirm required; never Approves).",
  },
  {
    name: "build_evidence_ship_report",
    audience: "photo",
    summary: "Ship checklist: dirty git paths under campaign-media/photos + gitignored derivative warning.",
  },
  {
    name: "write_registry_graduation_stub",
    audience: "photo",
    summary: "Write draft→registry markdown stub only — never mutates campaign-photo-registry.ts.",
  },
  {
    name: "propose_curated_placement",
    audience: "photo",
    summary: "Propose ordered HOMEPAGE_* ID diffs (gallery / Across AR / Meet Kelly / hero). No silent apply.",
  },
  {
    name: "apply_curated_placement",
    audience: "photo",
    summary: "Apply a placement proposal to homepage-campaign-photos.ts (confirmCurate required + undo snapshot).",
  },
  {
    name: "list_curated_placement_proposals",
    audience: "photo",
    summary: "List curated placement proposals and current HOMEPAGE_* snapshot.",
  },
  {
    name: "write_curated_placement_stub",
    audience: "photo",
    summary: "Rewrite curated-placement-stub.md for a proposal (review/paste aid — not apply).",
  },
  {
    name: "undo_curated_placement",
    audience: "photo",
    summary: "Restore homepage-campaign-photos.ts from an undo snapshot (confirmCurate required).",
  },
  {
    name: "get_speech_confirm_queue",
    audience: "video",
    summary: "Speech confirm queue: no-county / needs-publish / published / prep-ready totals.",
  },
  {
    name: "get_speech_readiness_matrix",
    audience: "video",
    summary: "Per-speech readiness: overlay · county · transcript · intel · master · clips · assembly.",
  },
  {
    name: "batch_save_speech_evidence",
    audience: "video",
    summary: "Field-level batch Save for speech overlays (counties/proof/status/do-not-claim).",
  },
  {
    name: "batch_publish_speech_flags",
    audience: "video",
    summary: "Batch approve/hold/publish/homepage for named speeches (empty-county skipped).",
  },
  {
    name: "undo_batch_speech_publish",
    audience: "video",
    summary: "Undo last speech publish batch from before-snapshot.",
  },
  {
    name: "propose_speech_placement",
    audience: "video",
    summary: "Propose HOMEPAGE_*_VIDEO_ID diffs for kelly-speaks homepage slots (no silent apply).",
  },
  {
    name: "apply_speech_placement",
    audience: "video",
    summary: "Apply speech placement proposal (confirmCurate required + undo).",
  },
  {
    name: "propose_video_edit_project",
    audience: "video",
    summary: "AI/deterministic Edit Director: ordered cut list + look/transition/captions/export pack (no silent render).",
  },
  {
    name: "update_video_edit_cutlist",
    audience: "video",
    summary: "Reorder / trim / drop Pro Edit clips (times/order only — never invent spoken lines).",
  },
  {
    name: "preview_video_edit_captions",
    audience: "video",
    summary: "Preview verbatim caption cues overlapping edit windows before burn-in (SRT/VTT).",
  },
  {
    name: "soft_archive_video_assemblies",
    audience: "video",
    summary: "Soft-archive assembly records (confirmArchive) — files never deleted.",
  },
  {
    name: "render_video_edit_project",
    audience: "video",
    summary: "Confirm-render Pro Edit: N-clip crossfade chain, SRT+VTT, look, loudnorm, multi-aspect pack.",
  },
  {
    name: "list_video_assemblies",
    audience: "video",
    summary: "List rendered Pro Edit assemblies and caption sidecars for a speech/outId.",
  },
];

export function evidenceAiToolsFor(
  kind: "photo" | "video",
  mode: EvidenceAiMode = "general",
): ChatCompletionTool[] {
  const both: ChatCompletionTool[] = [
    {
      type: "function",
      function: {
        name: "lookup_arkansas_county",
        description:
          "Validate an Arkansas county label (or short name). Returns registry match or not_found. Never invent counties.",
        parameters: {
          type: "object",
          properties: {
            label: { type: "string", description: "County label, e.g. Polk or Pulaski County" },
          },
          required: ["label"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "search_confirmed_memory",
        description:
          "Search confirmed Evidence Workbench memory examples by county, city, event, or free text. Soft priors only.",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string" },
            county: { type: "string" },
            city: { type: "string" },
            limit: { type: "number" },
          },
        },
      },
    },
    {
      type: "function",
      function: {
        name: "search_calendar_presence",
        description:
          "Search local calendar presence confirmations. Prefer Confirmed rows; do not treat Needs confirm as geography proof.",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "Match against summary/location/city/county" },
            county: { type: "string" },
            city: { type: "string" },
            dateFragment: { type: "string", description: "YYYY-MM or YYYY-MM-DD fragment" },
            status: {
              type: "string",
              enum: ["Confirmed", "Needs confirm", "Exclude", "Unknown", "any"],
            },
            limit: { type: "number" },
          },
        },
      },
    },
    {
      type: "function",
      function: {
        name: "rank_evidence_next_actions",
        description:
          "Rank the next operator actions from publish queue, speech confirm, calendar Needs confirm, intake, ship dirty, placement pending. Read-only.",
        parameters: {
          type: "object",
          properties: {
            limit: { type: "number", description: "Max actions (default 5, max 8)" },
          },
        },
      },
    },
    {
      type: "function",
      function: {
        name: "propose_event_night_pack",
        description:
          "Propose cue-aligned photos and speeches for one calendar presence row. Never invents geography matches. Soft when row is not Confirmed.",
        parameters: {
          type: "object",
          properties: {
            calendarRowId: { type: "string" },
            photoLimit: { type: "number" },
            speechLimit: { type: "number" },
          },
          required: ["calendarRowId"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "suggest_calendar_presence_fields",
        description:
          "Propose city/county/status for a calendar row from ICS summary/location text. Prefer Unknown; never auto-Confirm — propose Needs confirm at most.",
        parameters: {
          type: "object",
          properties: {
            calendarRowId: { type: "string" },
          },
          required: ["calendarRowId"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "get_website_surface_inventory",
        description:
          "Read live website surface inventory from campaign photo selectors: homepage gallery, Across Arkansas, county albums, From the Road covers, thin counties, curated IDs.",
        parameters: {
          type: "object",
          properties: {},
        },
      },
    },
  ];

  const photo: ChatCompletionTool[] = [
    {
      type: "function",
      function: {
        name: "find_similar_campaign_photos",
        description: "Find similar campaign photos by county, city, event name, or caption/filename keywords.",
        parameters: {
          type: "object",
          properties: {
            county: { type: "string" },
            city: { type: "string" },
            eventName: { type: "string" },
            query: { type: "string" },
            excludePhotoId: { type: "string" },
            limit: { type: "number" },
          },
        },
      },
    },
    {
      type: "function",
      function: {
        name: "get_photo_file_basics",
        description: "Inspect local public file basics for a campaign photo id or src path.",
        parameters: {
          type: "object",
          properties: {
            photoId: { type: "string" },
            src: { type: "string" },
          },
        },
      },
    },
    {
      type: "function",
      function: {
        name: "inspect_photo_pixels",
        description:
          "Read real pixel metadata via sharp (dimensions, format, EXIF orientation, aspect). Does not modify files.",
        parameters: {
          type: "object",
          properties: {
            photoId: { type: "string" },
            src: { type: "string" },
          },
        },
      },
    },
    {
      type: "function",
      function: {
        name: "suggest_crop_plan",
        description:
          "Recommend non-destructive derivative kinds (web_max, thumb, hero_16x9, portrait_4x5, square_1x1, auto_orient) for a photo id.",
        parameters: {
          type: "object",
          properties: {
            photoId: { type: "string" },
          },
          required: ["photoId"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "create_photo_derivative",
        description:
          "Create a non-destructive derivative under public/media/campaign-derivatives/. Never overwrites campaign-photos originals.",
        parameters: {
          type: "object",
          properties: {
            photoId: { type: "string" },
            kind: {
              type: "string",
              description:
                "web_max | thumb | hero_16x9 | portrait_4x5 | square_1x1 | auto_orient | focus_hero_16x9 | focus_portrait_4x5 | focus_square_1x1",
            },
            maxEdge: { type: "number" },
            quality: { type: "number" },
            note: { type: "string" },
            focusX: { type: "number", description: "Normalized 0–1 focus X for cover/focus crops" },
            focusY: { type: "number", description: "Normalized 0–1 focus Y for cover/focus crops" },
          },
          required: ["photoId", "kind"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "list_photo_derivatives",
        description: "List existing on-disk derivatives for a photo id (from the local ledger).",
        parameters: {
          type: "object",
          properties: {
            photoId: { type: "string" },
          },
          required: ["photoId"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "batch_apply_photo_evidence",
        description:
          "Apply selected evidence fields to multiple photo ids in one local write. Only write fields listed in applyFields. Prefer Unknown over inventing geography. Max 80 ids.",
        parameters: {
          type: "object",
          properties: {
            photoIds: { type: "array", items: { type: "string" } },
            applyFields: {
              type: "array",
              items: { type: "string" },
              description:
                "county, city, venue, eventDate, eventName, photographer, peopleVisible, whatThisProves, approvedForPublic, homepageCandidate, featuredPhoto, heroLevel, tierIntent, publicationStatus",
            },
            patch: {
              type: "object",
              description: "Field values to apply (only keys in applyFields are written).",
            },
            consentConfirmed: {
              type: "boolean",
              description: "Required when batching public flags onto consent-hold stills.",
            },
          },
          required: ["photoIds", "applyFields", "patch"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "batch_publish_photo_flags",
        description:
          "Batch approve, hold (off albums), or toggle homepage/featured flags for many photo ids. Skips Unknown county for public-raising actions unless allowUnknownCounty. Consent hold stills need consentConfirmed. Refreshes county albums once.",
        parameters: {
          type: "object",
          properties: {
            photoIds: { type: "array", items: { type: "string" } },
            action: {
              type: "string",
              enum: ["approve", "hold", "homepage_on", "homepage_off", "featured_on", "featured_off"],
            },
            consentConfirmed: { type: "boolean" },
            allowUnknownCounty: { type: "boolean" },
          },
          required: ["photoIds", "action"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "undo_batch_publish",
        description:
          "Undo a batch publish run by restoring before-snapshots. Omit runId to undo the latest undoable run.",
        parameters: {
          type: "object",
          properties: {
            runId: { type: "string" },
          },
        },
      },
    },
    {
      type: "function",
      function: {
        name: "list_evidence_batch_ops",
        description: "List recent Evidence Workbench batch publish and derivative operations.",
        parameters: {
          type: "object",
          properties: {
            limit: { type: "number" },
          },
        },
      },
    },
    {
      type: "function",
      function: {
        name: "get_photo_intake_status",
        description:
          "Read photo intake status: new files on disk, labeling queue size, unknown-county count, recommended next step.",
        parameters: {
          type: "object",
          properties: {},
        },
      },
    },
    {
      type: "function",
      function: {
        name: "intake_all_photos",
        description:
          "Operator-intent only. Flatten nested images under public/media/campaign-photos (copy, never delete) and queue all new stills into photo-ingest-drafts for labeling.",
        parameters: {
          type: "object",
          properties: {
            confirm: {
              type: "boolean",
              description: "Must be true — operator explicitly asked to intake.",
            },
          },
          required: ["confirm"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "cluster_photo_selection",
        description:
          "Cluster photo ids by shared event name, date cues, and county. Read-only — use before proposing batch fields.",
        parameters: {
          type: "object",
          properties: {
            photoIds: { type: "array", items: { type: "string" } },
          },
          required: ["photoIds"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "batch_create_photo_derivatives",
        description:
          "Create non-destructive derivatives for many photo ids. Kinds: web_max, thumb, hero_16x9, portrait_4x5, square_1x1, auto_orient. Max 40 photos × 4 kinds. Never overwrites originals. Prefer operator confirmation for large batches.",
        parameters: {
          type: "object",
          properties: {
            photoIds: { type: "array", items: { type: "string" } },
            kinds: { type: "array", items: { type: "string" } },
          },
          required: ["photoIds", "kinds"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "promote_photo_derivative",
        description:
          "Promote an existing derivative or Pro Edit assembly into public delivery: set publicSrcOverride and optional homepageCandidate / featuredPhoto / heroLevel / approvedForPublic. Requires confirmPromote:true. Does not delete originals.",
        parameters: {
          type: "object",
          properties: {
            photoId: { type: "string" },
            derivativeId: { type: "string" },
            publicSrc: { type: "string" },
            setAsPublicSrc: { type: "boolean" },
            homepageCandidate: { type: "boolean" },
            featuredPhoto: { type: "boolean" },
            heroLevel: { type: "string" },
            approvedForPublic: { type: "boolean" },
            consentConfirmed: { type: "boolean" },
            confirmPromote: { type: "boolean" },
          },
          required: ["photoId", "confirmPromote"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "create_focus_crop",
        description:
          "Create a focus-point cover crop. Kinds: focus_hero_16x9, focus_portrait_4x5, focus_square_1x1. Requires focusX/focusY in 0–1.",
        parameters: {
          type: "object",
          properties: {
            photoId: { type: "string" },
            kind: { type: "string" },
            focusX: { type: "number" },
            focusY: { type: "number" },
          },
          required: ["photoId", "kind", "focusX", "focusY"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "create_derivative_from_crop_advice",
        description:
          "Parse cropAdvice text into a focus crop kind and write a derivative. Pass focusX/focusY when known.",
        parameters: {
          type: "object",
          properties: {
            photoId: { type: "string" },
            cropAdvice: { type: "string" },
            focusX: { type: "number" },
            focusY: { type: "number" },
          },
          required: ["photoId", "cropAdvice"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "get_county_album_summary",
        description: "Summarize existing public county album chapters for a county short name or slug.",
        parameters: {
          type: "object",
          properties: {
            county: { type: "string" },
          },
          required: ["county"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "preview_placement_rules",
        description:
          "Given proposed flags, list which public surfaces would receive the photo. Does not invent geography.",
        parameters: {
          type: "object",
          properties: {
            county: { type: "string" },
            city: { type: "string" },
            homepageCandidate: { type: "boolean" },
            featuredPhoto: { type: "boolean" },
            approvedForPublic: { type: "boolean" },
            heroLevel: { type: "string", enum: ["HERO", "FEATURE", "SUPPORTING", "UNREVIEWED"] },
            publicationStatus: {
              type: "string",
              enum: ["DRAFT", "IN_REVIEW", "APPROVED", "PUBLISHED", "ARCHIVED"],
            },
          },
        },
      },
    },
    {
      type: "function",
      function: {
        name: "score_photo_website_fit",
        description:
          "Score where a photo fits on the live website (homepage, journey, county albums, From the Road, Meet Kelly). Uses proposed overlay fields when provided. Does not write.",
        parameters: {
          type: "object",
          properties: {
            photoId: { type: "string" },
            county: { type: "string" },
            city: { type: "string" },
            whatThisProves: { type: "string" },
            homepageCandidate: { type: "boolean" },
            featuredPhoto: { type: "boolean" },
            heroLevel: { type: "string" },
          },
          required: ["photoId"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "turbo_ingest_photos",
        description:
          "Operator-intent only. Optional intake, then identify + website-fit proposals for draft/unknown stills. Writes turbo-ingest-proposals.json only — never auto-approves.",
        parameters: {
          type: "object",
          properties: {
            confirm: { type: "boolean" },
            intakeFirst: { type: "boolean" },
            useAi: { type: "boolean" },
            maxPhotos: { type: "number" },
            photoIds: { type: "array", items: { type: "string" } },
          },
          required: ["confirm"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "apply_turbo_proposal",
        description:
          "Apply a turbo proposal's identify fields and/or fit flags (homepageCandidate/featured/hero/tier). Requires confirm:true. Does not silent-Approve.",
        parameters: {
          type: "object",
          properties: {
            photoId: { type: "string" },
            applyIdentify: { type: "boolean" },
            applyFitFlags: { type: "boolean" },
            confirm: { type: "boolean" },
          },
          required: ["photoId", "confirm"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "propose_photo_edit_project",
        description:
          "Propose a Photo Pro Edit project (look, focus-aware multi-aspect export pack including story 9:16 + film/bright/editorial looks). Does not render — operator must confirm render separately. Never auto-promotes.",
        parameters: {
          type: "object",
          properties: {
            photoId: { type: "string" },
            look: {
              type: "string",
              enum: [
                "neutral",
                "warm",
                "cool",
                "contrast",
                "soft",
                "punch",
                "mono",
                "film",
                "bright",
                "editorial",
              ],
            },
            exportSlots: {
              type: "array",
              items: {
                type: "string",
                enum: [
                  "grade_full",
                  "hero_16x9",
                  "portrait_4x5",
                  "square_1x1",
                  "story_9x16",
                  "web_max",
                  "thumb",
                ],
              },
            },
            useFocus: { type: "boolean" },
            focusX: { type: "number" },
            focusY: { type: "number" },
            sharpen: { type: "boolean" },
          },
          required: ["photoId"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "update_photo_edit_project",
        description:
          "Update a Photo Pro Edit project: set_meta (look/sharpen/focus/slots/promoteSuggestion), set_slots, or toggle_slot. Never silent-renders.",
        parameters: {
          type: "object",
          properties: {
            projectId: { type: "string" },
            updates: {
              type: "array",
              description:
                "Ops: set_meta{look,sharpen,useFocus,focusX,focusY,exportSlots,promoteSuggestion}, set_slots{exportSlots}, toggle_slot{slot,enabled}",
              items: { type: "object" },
            },
          },
          required: ["projectId", "updates"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "preview_photo_edit_pack",
        description:
          "Render a cheap graded preview JPEG for one slot of a Photo Pro Edit project. Never promotes. Prefer before Confirm render.",
        parameters: {
          type: "object",
          properties: {
            projectId: { type: "string" },
            slot: {
              type: "string",
              enum: [
                "grade_full",
                "hero_16x9",
                "portrait_4x5",
                "square_1x1",
                "story_9x16",
                "web_max",
                "thumb",
              ],
            },
          },
          required: ["projectId"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "soft_archive_photo_assemblies",
        description:
          "Soft-archive Photo Pro Edit assembly records. Requires confirmArchive:true. Never deletes files.",
        parameters: {
          type: "object",
          properties: {
            projectId: { type: "string" },
            photoId: { type: "string" },
            confirmArchive: { type: "boolean" },
          },
          required: ["confirmArchive"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "get_photo_readiness_matrix",
        description:
          "Rank stills by focus / Pro Edit / promote readiness. Prefer Unknown — never invents geography.",
        parameters: {
          type: "object",
          properties: {
            limit: { type: "number" },
            photoIds: { type: "array", items: { type: "string" } },
          },
        },
      },
    },
    {
      type: "function",
      function: {
        name: "render_photo_edit_project",
        description:
          "Render a Photo Pro Edit project into graded multi-aspect JPEGs and register them in the derivative ledger for Promote. Requires confirmRender:true. Originals never overwritten; promote remains a separate operator step.",
        parameters: {
          type: "object",
          properties: {
            projectId: { type: "string" },
            confirmRender: { type: "boolean" },
          },
          required: ["projectId", "confirmRender"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "list_photo_assemblies",
        description: "List Photo Pro Edit assemblies and projects for a photoId.",
        parameters: {
          type: "object",
          properties: {
            photoId: { type: "string" },
          },
          required: ["photoId"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "get_evidence_publish_queue",
        description:
          "Read the live Evidence Publish Queue: Unknown, drafts, turbo pending, needs approval, approved, consent holds, confirmed counties, and next operator actions. Never invents geography.",
        parameters: {
          type: "object",
          properties: {},
        },
      },
    },
    {
      type: "function",
      function: {
        name: "refresh_evidence_density_snapshot",
        description:
          "Write evidence-density-snapshot.json from the live queue and update EVIDENCE_DENSITY.md Unknown + approved-county counts. Optional evening log fields. Does not Approve photos.",
        parameters: {
          type: "object",
          properties: {
            updateDensityDoc: { type: "boolean" },
            publishedToday: { type: "string" },
            createdNotPublished: { type: "string" },
            note: { type: "string" },
          },
        },
      },
    },
    {
      type: "function",
      function: {
        name: "run_publish_queue_turbo",
        description:
          "Run Turbo Identify+Fit on Unknown/draft publish-queue targets only. Requires confirm:true. Never auto-Approves.",
        parameters: {
          type: "object",
          properties: {
            confirm: { type: "boolean" },
            useAi: { type: "boolean" },
            maxPhotos: { type: "number" },
          },
          required: ["confirm"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "build_evidence_ship_report",
        description:
          "Build the Evidence Ship Checklist report: git dirty paths under data/campaign-media and campaign-photos, checklist gates, commit message template, and gitignored derivative warnings. Never commits.",
        parameters: {
          type: "object",
          properties: {
            persist: { type: "boolean" },
            includeDerivativeScan: { type: "boolean" },
          },
        },
      },
    },
    {
      type: "function",
      function: {
        name: "write_registry_graduation_stub",
        description:
          "Write data/campaign-media/registry-graduation-stub.md with copy-paste registry entries for ready drafts. Never mutates campaign-photo-registry.ts.",
        parameters: {
          type: "object",
          properties: {
            onlyReady: { type: "boolean" },
          },
        },
      },
    },
    {
      type: "function",
      function: {
        name: "propose_curated_placement",
        description:
          "Propose ordered HOMEPAGE_* curated ID diffs for homepage gallery, Across Arkansas, Meet Kelly, and optional hero. Writes proposal JSON + stub. Does not rewrite TS — use apply_curated_placement with confirmCurate.",
        parameters: {
          type: "object",
          properties: {
            allowHero: { type: "boolean" },
            galleryMax: { type: "number" },
            acrossMax: { type: "number" },
          },
        },
      },
    },
    {
      type: "function",
      function: {
        name: "apply_curated_placement",
        description:
          "Apply a curated placement proposal to src/content/media/homepage-campaign-photos.ts. Requires confirmCurate:true. Saves undo snapshot. Never silent.",
        parameters: {
          type: "object",
          properties: {
            proposalId: { type: "string" },
            confirmCurate: { type: "boolean" },
          },
          required: ["proposalId", "confirmCurate"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "list_curated_placement_proposals",
        description: "List curated placement proposals and the current HOMEPAGE_* ID snapshot.",
        parameters: {
          type: "object",
          properties: {},
        },
      },
    },
    {
      type: "function",
      function: {
        name: "write_curated_placement_stub",
        description:
          "Rewrite data/campaign-media/curated-placement-stub.md for a named proposal. Review/paste aid only — does not apply.",
        parameters: {
          type: "object",
          properties: {
            proposalId: { type: "string" },
          },
          required: ["proposalId"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "undo_curated_placement",
        description:
          "Restore src/content/media/homepage-campaign-photos.ts from a prior apply backup. Requires confirmCurate:true and undoSnapshotId.",
        parameters: {
          type: "object",
          properties: {
            undoSnapshotId: { type: "string" },
            confirmCurate: { type: "boolean" },
          },
          required: ["undoSnapshotId", "confirmCurate"],
        },
      },
    },
  ];

  const video: ChatCompletionTool[] = [
    {
      type: "function",
      function: {
        name: "get_video_transcript_excerpt",
        description:
          "Load a transcript excerpt from the local YouTube transcript workspace if present. Empty means no local transcript.",
        parameters: {
          type: "object",
          properties: {
            youtubeVideoId: { type: "string" },
            maxChars: { type: "number" },
          },
          required: ["youtubeVideoId"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "search_campaign_speeches",
        description: "Search campaign speech/video registry by title, topics, counties, or youtube id.",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string" },
            county: { type: "string" },
            limit: { type: "number" },
          },
        },
      },
    },
    {
      type: "function",
      function: {
        name: "get_speech_registry_record",
        description: "Fetch one speech registry record by media id or youtube video id.",
        parameters: {
          type: "object",
          properties: {
            speechId: { type: "string" },
            youtubeVideoId: { type: "string" },
          },
        },
      },
    },
    {
      type: "function",
      function: {
        name: "probe_video_tooling",
        description:
          "Check whether ffmpeg/ffprobe are available (prefers H:/SOSWebsite/.local/ffmpeg/bin).",
        parameters: {
          type: "object",
          properties: {},
        },
      },
    },
    {
      type: "function",
      function: {
        name: "probe_local_video",
        description:
          "ffprobe a local master under public/media/campaign-video-masters or .local/video-masters. Optional start/end checks clip bounds.",
        parameters: {
          type: "object",
          properties: {
            speechId: { type: "string" },
            youtubeVideoId: { type: "string" },
            localPublicSrc: { type: "string" },
            startSeconds: { type: "number" },
            endSeconds: { type: "number" },
          },
        },
      },
    },
    {
      type: "function",
      function: {
        name: "extract_video_poster",
        description:
          "Extract one poster JPEG from a local video master at atSeconds. Writes under /media/campaign-derivatives/_video/. Requires confirmPoster:true.",
        parameters: {
          type: "object",
          properties: {
            outId: { type: "string", description: "Usually speechId" },
            speechId: { type: "string" },
            youtubeVideoId: { type: "string" },
            localPublicSrc: { type: "string" },
            atSeconds: { type: "number" },
            confirmPoster: { type: "boolean" },
          },
          required: ["outId", "confirmPoster"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "encode_video_excerpt",
        description:
          "Encode a timed MP4 excerpt from a local master into campaign-derivatives. Prefer planId+clipIndex from plan_video_excerpt, or pass startSeconds/endSeconds. Max 120s per clip. Requires confirmEncode:true when called from the AI brain.",
        parameters: {
          type: "object",
          properties: {
            outId: { type: "string", description: "Usually speechId" },
            speechId: { type: "string" },
            youtubeVideoId: { type: "string" },
            planId: { type: "string" },
            clipIndex: { type: "number" },
            startSeconds: { type: "number" },
            endSeconds: { type: "number" },
            localPublicSrc: { type: "string" },
            aspect: { type: "string", enum: ["source", "vertical_9x16"] },
            confirmEncode: {
              type: "boolean",
              description: "Must be true — operator explicitly asked to encode.",
            },
          },
          required: ["outId", "confirmEncode"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "analyze_transcript_intelligence",
        description:
          "Analyze local transcript workspace into chapters, verbatim quotes, claim candidates tied to evidence fields, and do-not-claim guardrails. Does not invent geography or spoken lines.",
        parameters: {
          type: "object",
          properties: {
            youtubeVideoId: { type: "string" },
            speechId: { type: "string" },
          },
          required: ["youtubeVideoId"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "plan_video_excerpt",
        description:
          "Build timed clip candidates from the local YouTube transcript workspace. Does not encode; use when proposing short cuts.",
        parameters: {
          type: "object",
          properties: {
            youtubeVideoId: { type: "string" },
            query: { type: "string" },
            maxClips: { type: "number" },
          },
          required: ["youtubeVideoId"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "prep_video_package",
        description:
          "One-shot Evidence Video Prep: probe tooling, find master, plan excerpts, analyze transcript intel. Set confirmEncode/confirmPoster true only when the operator explicitly asks to write clips/posters.",
        parameters: {
          type: "object",
          properties: {
            speechId: { type: "string" },
            youtubeVideoId: { type: "string" },
            query: { type: "string" },
            maxClips: { type: "number" },
            confirmEncode: { type: "boolean" },
            confirmPoster: { type: "boolean" },
            aspect: { type: "string", enum: ["source", "vertical_9x16"] },
          },
          required: ["speechId", "youtubeVideoId"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "list_video_derivatives",
        description: "List encoded clips and poster stills for a speech/outId from the derivatives ledger.",
        parameters: {
          type: "object",
          properties: {
            outId: { type: "string", description: "Usually speechId" },
          },
          required: ["outId"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "apply_transcript_intelligence",
        description:
          "Apply a stored transcript-intel proposal to the speech overlay. Requires confirm:true and applyFields. Does not invent lines.",
        parameters: {
          type: "object",
          properties: {
            speechId: { type: "string" },
            proposalId: { type: "string" },
            applyFields: {
              type: "array",
              items: {
                type: "string",
                enum: [
                  "whatThisProves",
                  "speakerNotes",
                  "keyQuotes",
                  "doNotClaim",
                  "transcriptChapters",
                ],
              },
            },
            claimIndex: { type: "number" },
            confirm: { type: "boolean" },
          },
          required: ["speechId", "proposalId", "applyFields", "confirm"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "propose_video_edit_project",
        description:
          "Propose a Pro Edit project (ordered clips from plan/intel, look, transition, caption mode, export aspects). Does not render — operator must confirm render separately.",
        parameters: {
          type: "object",
          properties: {
            speechId: { type: "string" },
            youtubeVideoId: { type: "string" },
            planId: { type: "string" },
            maxClips: { type: "number" },
            transition: { type: "string", enum: ["none", "crossfade"] },
            look: { type: "string", enum: ["neutral", "warm", "cool", "contrast"] },
            captionMode: { type: "string", enum: ["none", "sidecar", "burn_in"] },
            exportAspects: {
              type: "array",
              items: {
                type: "string",
                enum: ["source", "vertical_9x16", "square_1x1", "landscape_16x9"],
              },
            },
            loudnorm: { type: "boolean" },
          },
          required: ["speechId", "youtubeVideoId"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "update_video_edit_cutlist",
        description:
          "Update a Pro Edit cut list: reorder, remove, or trim clip times. Never invents quote/spoken text.",
        parameters: {
          type: "object",
          properties: {
            projectId: { type: "string" },
            updates: {
              type: "array",
              description: "Ops: reorder{clipIds}, remove{clipId}, trim{clipId,startSeconds,endSeconds}, set_meta{look,transition,captionMode,exportAspects,loudnorm}",
              items: { type: "object" },
            },
          },
          required: ["projectId", "updates"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "preview_video_edit_captions",
        description:
          "Preview verbatim caption cues for an edit project. Never invents spoken lines.",
        parameters: {
          type: "object",
          properties: {
            projectId: { type: "string" },
            youtubeVideoId: { type: "string" },
            limit: { type: "number" },
          },
        },
      },
    },
    {
      type: "function",
      function: {
        name: "soft_archive_video_assemblies",
        description:
          "Soft-archive assembly records. Requires confirmArchive:true. Never deletes files.",
        parameters: {
          type: "object",
          properties: {
            projectId: { type: "string" },
            outId: { type: "string" },
            confirmArchive: { type: "boolean" },
          },
          required: ["confirmArchive"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "render_video_edit_project",
        description:
          "Render a Pro Edit project into assembly MP4s (N-clip crossfade chain or hard cut + look + loudnorm + aspect pack + SRT/VTT). Requires confirmRender:true.",
        parameters: {
          type: "object",
          properties: {
            projectId: { type: "string" },
            confirmRender: { type: "boolean" },
          },
          required: ["projectId", "confirmRender"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "list_video_assemblies",
        description: "List Pro Edit assemblies and caption sidecars for a speech/outId.",
        parameters: {
          type: "object",
          properties: {
            outId: { type: "string" },
          },
          required: ["outId"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "get_speech_confirm_queue",
        description:
          "Build speech confirm queue totals and sample buckets (no-county, needs-publish, published, prep-ready).",
        parameters: { type: "object", properties: {} },
      },
    },
    {
      type: "function",
      function: {
        name: "get_speech_readiness_matrix",
        description:
          "Per-speech readiness matrix: overlay, county, transcript, intel, master, clips, assemblies, next action.",
        parameters: {
          type: "object",
          properties: {
            speechIds: { type: "array", items: { type: "string" } },
          },
        },
      },
    },
    {
      type: "function",
      function: {
        name: "batch_save_speech_evidence",
        description:
          "Apply named fields to multiple speech overlays. Never invents geography. Operator must supply values.",
        parameters: {
          type: "object",
          properties: {
            speechIds: { type: "array", items: { type: "string" } },
            applyFields: { type: "array", items: { type: "string" } },
            counties: { type: "string" },
            city: { type: "string" },
            venue: { type: "string" },
            eventDate: { type: "string" },
            eventName: { type: "string" },
            whatThisProves: { type: "string" },
            doNotClaim: { type: "string" },
            publicationStatus: { type: "string" },
            approvedForPublic: { type: "boolean" },
            homepageCandidate: { type: "boolean" },
          },
          required: ["speechIds", "applyFields"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "batch_publish_speech_flags",
        description:
          "Batch approve / hold / publish / homepage_on / homepage_off for named speech ids. Empty-county skipped on public-raising actions.",
        parameters: {
          type: "object",
          properties: {
            speechIds: { type: "array", items: { type: "string" } },
            action: {
              type: "string",
              enum: ["approve", "hold", "publish", "homepage_on", "homepage_off"],
            },
          },
          required: ["speechIds", "action"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "undo_batch_speech_publish",
        description: "Undo the last (or named) speech publish batch using before-snapshots.",
        parameters: {
          type: "object",
          properties: {
            runId: { type: "string" },
          },
        },
      },
    },
    {
      type: "function",
      function: {
        name: "propose_speech_placement",
        description:
          "Propose HOMEPAGE_PRIMARY_MESSAGE_VIDEO_ID / HOMEPAGE_ACROSS_ARKANSAS_VIDEO_ID diffs. Does not rewrite TS — use apply_speech_placement with confirmCurate.",
        parameters: { type: "object", properties: {} },
      },
    },
    {
      type: "function",
      function: {
        name: "apply_speech_placement",
        description:
          "Apply a speech placement proposal to homepage-campaign-videos.ts. Requires confirmCurate:true.",
        parameters: {
          type: "object",
          properties: {
            proposalId: { type: "string" },
            confirmCurate: { type: "boolean" },
          },
          required: ["proposalId", "confirmCurate"],
        },
      },
    },
  ];

  const all =
    mode === "command"
      ? [...both, ...photo, ...video]
      : kind === "photo"
        ? [...both, ...photo]
        : [...both, ...video];
  const allow = toolNamesForMode(kind, mode);
  if (!allow) return all;
  return all.filter((t) => t.type === "function" && allow.has(t.function.name));
}
