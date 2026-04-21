const DEFAULT_TIMEOUT_MS = 20_000;

export class SubstackFeedError extends Error {
  constructor(
    message: string,
    public readonly causeCode: "missing_url" | "network" | "empty" | "parse",
  ) {
    super(message);
    this.name = "SubstackFeedError";
  }
}

export async function fetchSubstackFeedXml(feedUrl: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<string> {
  const url = feedUrl.trim();
  if (!url) {
    throw new SubstackFeedError("Substack feed URL is not configured.", "missing_url");
  }

  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        Accept: "application/rss+xml, application/xml, text/xml, */*",
        "User-Agent": "RedDirtSite/1.0 (content sync)",
      },
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    throw new SubstackFeedError("Could not reach the Substack feed URL.", "network");
  }

  if (!res.ok) {
    throw new SubstackFeedError(`Feed returned HTTP ${res.status}.`, "network");
  }

  const text = await res.text();
  if (!text.trim()) {
    throw new SubstackFeedError("Feed response was empty.", "empty");
  }

  return text;
}
