import type { YouTubeChannelConfig } from "./types";

const API = "https://www.googleapis.com/youtube/v3";

export type YouTubeClient = {
  listChannelUploads: (opts: { maxResults?: number }) => Promise<{ items: unknown[] }>;
};

export function createYouTubeClient(config: YouTubeChannelConfig): YouTubeClient {
  const key =
    (config.apiKeyEnvKey ? process.env[config.apiKeyEnvKey]?.trim() : null) ??
    process.env.YOUTUBE_API_KEY?.trim();

  return {
    async listChannelUploads({ maxResults = 25 } = {}) {
      if (!key) {
        throw new Error("YouTube API key not configured (YOUTUBE_API_KEY).");
      }
      const searchUrl = `${API}/search?part=snippet&channelId=${encodeURIComponent(config.channelId)}&maxResults=${maxResults}&order=date&type=video&key=${encodeURIComponent(key)}`;
      const res = await fetch(searchUrl, { next: { revalidate: 0 } });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`YouTube API error ${res.status}: ${text.slice(0, 200)}`);
      }
      const json = (await res.json()) as { items?: unknown[] };
      return { items: json.items ?? [] };
    },
  };
}
