import { siteConfig } from "@/config/site";
import { attachKellySeo, type MediaRef } from "@/content/media/media-ref";

function absoluteUrl(path: string): string {
  const base = siteConfig.url.replace(/\/$/, "");
  return path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function imageObjectJsonLd(still: MediaRef, pagePath?: string): Record<string, unknown> {
  const m = attachKellySeo(still);
  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    contentUrl: absoluteUrl(m.src),
    url: pagePath ? absoluteUrl(pagePath) : absoluteUrl(m.src),
    name: m.seoTitle ?? m.alt,
    description: m.seoDescription ?? m.alt,
    caption: m.caption ?? m.alt,
    width: m.width,
    height: m.height,
    creditText: m.credit,
    copyrightHolder: {
      "@type": "Organization",
      name: "Kelly Grappe for Secretary of State",
    },
    creator: {
      "@type": "Person",
      name: "Kelly Grappe",
      jobTitle: "Candidate for Arkansas Secretary of State",
      url: absoluteUrl("/"),
    },
    about: {
      "@type": "Person",
      name: "Kelly Grappe",
      jobTitle: "Candidate for Arkansas Secretary of State",
    },
    contentLocation: {
      "@type": "State",
      name: "Arkansas",
    },
  };
}
