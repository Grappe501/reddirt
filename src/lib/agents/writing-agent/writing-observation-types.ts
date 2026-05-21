/** Client-safe writing observation metadata (no full bodies). */
export type WritingObservationMeta = {
  textType: string;
  audience?: string;
  role?: string;
  userEdited: boolean;
  acceptedAsIs?: boolean;
  shortened?: boolean;
  expanded?: boolean;
  toneChanged?: boolean;
  plainLanguageRequested?: boolean;
  recordId?: string | null;
  snippetHint?: string;
};
