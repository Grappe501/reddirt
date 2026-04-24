import type { NextConfig } from "next";
import { OWNED_MEDIA_SERVER_ACTION_BODY_LIMIT } from "./src/lib/owned-media/limits";

/**
 * Default Next.js build so App Router API routes work on Netlify via @netlify/plugin-nextjs.
 */
const nextConfig: NextConfig = {
  /** Optional: legacy client env if you add Google Maps elsewhere; /events uses OpenStreetMap + Leaflet. */
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? process.env.GOOGLE_MAPS_API_KEY ?? "",
  },
  /** Hide the corner dev badge on a clean marketing hero; errors still surface in the overlay. */
  devIndicators: false,
  experimental: {
    serverActions: {
      /** Campaign-owned video/audio uploads — must be ≥ `ABSOLUTE_OWNED_MEDIA_MAX_BYTES` in `src/lib/owned-media/limits.ts`. */
      bodySizeLimit: OWNED_MEDIA_SERVER_ACTION_BODY_LIMIT,
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.squarespace-cdn.com", pathname: "/content/**" },
      { protocol: "https", hostname: "static1.squarespace.com", pathname: "/**" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/the-arkansas-we-know",
        destination: "/",
        permanent: true,
      },
      {
        source: "/why-this-movement",
        destination: "/understand",
        permanent: true,
      },
      {
        source: "/resources/direct-democracy-basics",
        destination: "/resources/direct-democracy-guide",
        permanent: true,
      },
      {
        source: "/resources/arkansas-ballot-initiative-process",
        destination: "/resources/direct-democracy-guide",
        permanent: true,
      },
      {
        source: "/campaign-trail",
        destination: "/from-the-road",
        permanent: false,
      },
      {
        source: "/updates",
        destination: "/from-the-road",
        permanent: true,
      },
      {
        source: "/watch",
        destination: "/from-the-road",
        permanent: false,
      },
    ];
  },
  // pdf-parse must stay external: its test harness references missing test/ PDFs and breaks the bundler.
  serverExternalPackages: ["@prisma/client", "pdf-parse"],
};

export default nextConfig;
