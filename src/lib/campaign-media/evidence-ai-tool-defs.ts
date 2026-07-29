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
    name: "plan_video_excerpt",
    audience: "video",
    summary: "Build timed clip candidates from the local transcript workspace (no encode yet).",
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
              description: "web_max | thumb | hero_16x9 | portrait_4x5 | square_1x1 | auto_orient",
            },
            maxEdge: { type: "number" },
            quality: { type: "number" },
            note: { type: "string" },
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
        description: "Check whether ffmpeg/ffprobe are installed for local video encode / poster extraction.",
        parameters: {
          type: "object",
          properties: {},
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
  ];

  return kind === "photo" ? [...both, ...photo] : [...both, ...video];
}
