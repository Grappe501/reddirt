import type { FacebookPageConfig } from "./types";

const GRAPH = "https://graph.facebook.com/v21.0";

export type FacebookClient = {
  /** Fetch recent Page feed posts (placeholder until token + page id are configured). */
  fetchRecentPagePosts: (opts: { limit?: number }) => Promise<{ data: unknown[] }>;
};

/**
 * Factory for Graph API calls. Real usage requires a Page access token with `pages_read_engagement`
 * (and relevant Page IDs). See README.
 */
export function createFacebookClient(config: FacebookPageConfig): FacebookClient {
  const token = config.accessTokenEnvKey
    ? process.env[config.accessTokenEnvKey]?.trim()
    : process.env.FACEBOOK_PAGE_ACCESS_TOKEN?.trim();

  return {
    async fetchRecentPagePosts({ limit = 25 } = {}) {
      if (!token) {
        throw new Error("Facebook Page access token not configured (env FACEBOOK_PAGE_ACCESS_TOKEN or custom key).");
      }
      const url = `${GRAPH}/${encodeURIComponent(config.pageId)}/feed?fields=id,message,created_time,permalink_url&limit=${limit}&access_token=${encodeURIComponent(token)}`;
      const res = await fetch(url, { next: { revalidate: 0 } });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Facebook Graph error ${res.status}: ${text.slice(0, 200)}`);
      }
      return (await res.json()) as { data: unknown[] };
    },
  };
}
