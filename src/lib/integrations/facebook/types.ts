/**
 * Facebook Graph API types (Page-focused). Expand as real ingestion ships.
 * @see README.md for env vars and app review notes.
 */

export type FacebookPageConfig = {
  pageId: string;
  /** Never store long-lived tokens in the database — use env or a secrets manager. */
  accessTokenEnvKey?: string;
};

export type NormalizedPagePost = {
  externalId: string;
  sourceType: "POST" | "COMMENT" | "VIDEO" | "OTHER";
  message: string | null;
  permalinkUrl: string | null;
  createdTime: Date | null;
  raw: Record<string, unknown>;
};
