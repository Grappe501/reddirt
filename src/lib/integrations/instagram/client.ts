import type { InstagramMediaConfig } from "./types";

const GRAPH = "https://graph.facebook.com/v21.0";

export type InstagramClient = {
  fetchRecentMedia: (opts: { limit?: number }) => Promise<{ data: unknown[] }>;
};

export function createInstagramClient(config: InstagramMediaConfig): InstagramClient {
  const token = config.accessTokenEnvKey
    ? process.env[config.accessTokenEnvKey]?.trim()
    : process.env.INSTAGRAM_ACCESS_TOKEN?.trim();

  return {
    async fetchRecentMedia({ limit = 25 } = {}) {
      if (!token) {
        throw new Error("Instagram access token not configured (INSTAGRAM_ACCESS_TOKEN).");
      }
      const fields = "id,caption,media_type,media_url,permalink,timestamp";
      const url = `${GRAPH}/${encodeURIComponent(config.igUserId)}/media?fields=${fields}&limit=${limit}&access_token=${encodeURIComponent(token)}`;
      const res = await fetch(url, { next: { revalidate: 0 } });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Instagram Graph error ${res.status}: ${text.slice(0, 200)}`);
      }
      return (await res.json()) as { data: unknown[] };
    },
  };
}
