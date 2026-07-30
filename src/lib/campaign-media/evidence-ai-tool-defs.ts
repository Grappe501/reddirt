/**
 * OpenAI tool schemas for the Evidence Workbench brain.
 * Executors live in evidence-ai-tool-runtime.ts (server-only).
 */

import type { ChatCompletionTool } from "openai/resources/chat/completions";

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
    name: "render_photo_edit_project",
    audience: "photo",
    summary: "Confirm-render a Photo Pro Edit project: graded multi-aspect assembly pack.",
  },
  {
    name: "list_photo_assemblies",
    audience: "photo",
    summary: "List Photo Pro Edit assemblies for a photoId.",
  },
  {
    name: "propose_video_edit_project",
    audience: "video",
    summary: "AI/deterministic Edit Director: ordered cut list + look/transition/captions/export pack (no silent render).",
  },
  {
    name: "render_video_edit_project",
    audience: "video",
    summary: "Confirm-render a Pro Edit project: concat, look, loudnorm, captions, multi-aspect pack.",
  },
  {
    name: "list_video_assemblies",
    audience: "video",
    summary: "List rendered Pro Edit assemblies and caption sidecars for a speech/outId.",
  },
];

export function evidenceAiToolsFor(kind: "photo" | "video"): ChatCompletionTool[] {
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
          "Promote an existing derivative into public delivery: set publicSrcOverride and optional homepageCandidate / featuredPhoto / heroLevel / approvedForPublic. Does not delete originals. Prefer operator confirmation.",
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
          },
          required: ["photoId"],
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
          "Propose a Photo Pro Edit project (look, focus-aware multi-aspect export pack including story 9:16). Does not render — operator must confirm render separately. Never auto-promotes.",
        parameters: {
          type: "object",
          properties: {
            photoId: { type: "string" },
            look: {
              type: "string",
              enum: ["neutral", "warm", "cool", "contrast", "soft", "punch", "mono"],
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
        name: "render_photo_edit_project",
        description:
          "Render a Photo Pro Edit project into graded multi-aspect JPEGs. Requires confirmRender:true. Originals never overwritten; promote remains a separate operator step.",
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
          "Extract one poster JPEG from a local video master at atSeconds. Writes under /media/campaign-derivatives/_video/.",
        parameters: {
          type: "object",
          properties: {
            outId: { type: "string", description: "Usually speechId" },
            speechId: { type: "string" },
            youtubeVideoId: { type: "string" },
            localPublicSrc: { type: "string" },
            atSeconds: { type: "number" },
          },
          required: ["outId"],
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
        name: "render_video_edit_project",
        description:
          "Render a Pro Edit project into assembly MP4s (concat/crossfade + look + loudnorm + aspect pack + optional captions). Requires confirmRender:true.",
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
  ];

  return kind === "photo" ? [...both, ...photo] : [...both, ...video];
}
