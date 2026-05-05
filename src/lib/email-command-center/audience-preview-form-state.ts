/** Shared types for Audience Studio preview `useFormState` (not a server-only module). */

export type PreviewEmailAudienceState =
  | { status: "idle" }
  | { status: "success"; matchCount: number; samples: Array<Record<string, unknown>>; limitations: string[] }
  | { status: "error"; error: string };

export const initialPreviewState: PreviewEmailAudienceState = { status: "idle" };
