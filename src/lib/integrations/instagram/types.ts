export type InstagramMediaConfig = {
  igUserId: string;
  accessTokenEnvKey?: string;
};

export type NormalizedIgMedia = {
  externalId: string;
  caption: string | null;
  permalink: string | null;
  mediaType: string | null;
  timestamp: Date | null;
  raw: Record<string, unknown>;
};
