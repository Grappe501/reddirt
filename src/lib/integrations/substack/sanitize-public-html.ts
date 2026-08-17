import sanitizeHtml from "sanitize-html";
import { fromTheRoadPostHref, getCampaignBlogUrl } from "@/config/external-campaign";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Turn RSS/API plaintext (or mixed) into paragraph HTML before sanitizing. */
export function htmlFromFeedContent(raw: string): string {
  const t = (raw ?? "").trim();
  if (!t) return "";
  if (/<[a-z][\s\S]*>/i.test(t)) return t;
  return t
    .split(/\n{2,}/)
    .map((block) => {
      const inner = escapeHtml(block.trim()).replace(/\n/g, "<br />");
      return inner ? `<p>${inner}</p>` : "";
    })
    .filter(Boolean)
    .join("");
}

function publicationHost(): string | null {
  try {
    return new URL(getCampaignBlogUrl()).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Same-publication /p/{slug} links become native journal URLs.
 * Subscribe, comments, and other Substack surfaces stay on Substack.
 */
export function rewritePublicationHref(href: string): { href: string; internal: boolean } {
  const trimmed = href.trim();
  if (!trimmed) return { href: trimmed, internal: false };
  const host = publicationHost();
  if (!host) return { href: trimmed, internal: false };

  try {
    const base = getCampaignBlogUrl();
    const u = trimmed.startsWith("/") ? new URL(trimmed, base) : new URL(trimmed);
    if (u.hostname.toLowerCase() !== host) return { href: trimmed, internal: false };

    const parts = u.pathname.split("/").filter(Boolean);
    const pIdx = parts.indexOf("p");
    const slug = pIdx >= 0 ? parts[pIdx + 1] : null;
    const afterSlug = pIdx >= 0 ? parts.slice(pIdx + 2) : [];

    if (slug && afterSlug.length === 0 && !u.search && !u.hash) {
      return { href: fromTheRoadPostHref(slug), internal: true };
    }
    return { href: u.toString(), internal: false };
  } catch {
    return { href: trimmed, internal: false };
  }
}

const articleOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    ...sanitizeHtml.defaults.allowedTags,
    "img",
    "figure",
    "figcaption",
    "h1",
    "h2",
    "h3",
    "h4",
  ],
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ["src", "alt", "title", "width", "height", "loading"],
    a: ["href", "name", "target", "rel"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    a: (_tagName, attribs): sanitizeHtml.Tag => {
      const rewritten = rewritePublicationHref(attribs.href ?? "");
      if (rewritten.internal) {
        return { tagName: "a", attribs: { href: rewritten.href } };
      }
      return {
        tagName: "a",
        attribs: {
          href: rewritten.href || attribs.href || "#",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      };
    },
    img: sanitizeHtml.simpleTransform("img", { loading: "lazy" }),
  },
};

export function sanitizeSubstackArticleHtml(input: string): string {
  return sanitizeHtml(htmlFromFeedContent(input), articleOptions).trim();
}

export function isLikelyPaywalledHtml(html: string): boolean {
  const plain = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} });
  return /this post is for paying subscribers|upgrade to paid|paid subscribers only/i.test(plain);
}
