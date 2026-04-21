import type { NextConfig } from "next";

/**
 * Default Next.js build so App Router API routes work on Netlify via @netlify/plugin-nextjs.
 */
const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      /** Campaign-owned video/audio uploads (keep aligned with OWNED_MEDIA_MAX_BYTES). */
      bodySizeLimit: "500mb",
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.squarespace-cdn.com", pathname: "/content/**" },
      { protocol: "https", hostname: "static1.squarespace.com", pathname: "/**" },
    ],
  },
  // pdf-parse must stay external: its test harness references missing test/ PDFs and breaks the bundler.
  serverExternalPackages: ["@prisma/client", "pdf-parse"],
};

export default nextConfig;
