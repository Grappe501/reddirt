import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

function absoluteUrl(path: string): string {
  const base = siteConfig.url.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export function articleMeta(opts: {
  title: string;
  description: string;
  path: string;
  /** Absolute or site-root path (e.g. /media/...) for OG image */
  imageSrc?: string;
  publishedTime?: string;
}): Metadata {
  const ogImage =
    opts.imageSrc &&
    (opts.imageSrc.startsWith("http") ? opts.imageSrc : absoluteUrl(opts.imageSrc));

  return {
    title: opts.title,
    description: opts.description,
    openGraph: {
      title: `${opts.title} · ${siteConfig.name}`,
      description: opts.description,
      url: absoluteUrl(opts.path),
      siteName: siteConfig.name,
      locale: "en_US",
      type: "article",
      publishedTime: opts.publishedTime,
      images: ogImage
        ? [{ url: ogImage, width: 1200, height: 630, alt: opts.title }]
        : [{ url: absoluteUrl("/media/placeholders/og-default.svg"), width: 1200, height: 630, alt: siteConfig.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: ogImage ? [ogImage] : [absoluteUrl("/media/placeholders/og-default.svg")],
    },
  };
}

export function pageMeta(opts: {
  title: string;
  description: string;
  path: string;
  imageSrc?: string;
}): Metadata {
  const ogImage =
    opts.imageSrc &&
    (opts.imageSrc.startsWith("http") ? opts.imageSrc : absoluteUrl(opts.imageSrc));

  return {
    title: opts.title,
    description: opts.description,
    openGraph: {
      title: `${opts.title} · ${siteConfig.name}`,
      description: opts.description,
      url: absoluteUrl(opts.path),
      siteName: siteConfig.name,
      locale: "en_US",
      type: "website",
      images: ogImage
        ? [{ url: ogImage, width: 1200, height: 630, alt: opts.title }]
        : [{ url: absoluteUrl("/media/placeholders/og-default.svg"), width: 1200, height: 630, alt: siteConfig.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: ogImage ? [ogImage] : [absoluteUrl("/media/placeholders/og-default.svg")],
    },
  };
}

/**
 * Standard metadata for `/organizing-intelligence/regions/[slug]` dashboards.
 * Keeps Open Graph URLs and titles consistent for regional share previews.
 */
export function organizingIntelligenceRegionPageMeta(opts: {
  /** Human label, e.g. "River Valley" */
  regionTitle: string;
  /** URL segment, e.g. "river-valley" */
  slug: string;
  description: string;
}): Metadata {
  return pageMeta({
    title: `${opts.regionTitle} — Arkansas organizing intelligence`,
    description: opts.description,
    path: `/organizing-intelligence/regions/${opts.slug}`,
  });
}
