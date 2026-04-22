import type { NextConfig } from "next";

/**
 * Default Next.js build so App Router API routes work on Netlify via @netlify/plugin-nextjs.
 */
const nextConfig: NextConfig = {
  /**
   * Expose the Maps key to the client bundle. Google Maps only runs in the browser; the key must
   * be public and restricted by HTTP referrer in Google Cloud. Mirrors GOOGLE_MAPS_API_KEY if set.
   */
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? process.env.GOOGLE_MAPS_API_KEY ?? "",
  },
  /** Hide the corner dev badge on a clean marketing hero; errors still surface in the overlay. */
  devIndicators: false,
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
  async redirects() {
    return [
      {
        source: "/the-arkansas-we-know",
        destination: "/",
        permanent: true,
      },
    ];
  },
  // pdf-parse must stay external: its test harness references missing test/ PDFs and breaks the bundler.
  serverExternalPackages: ["@prisma/client", "pdf-parse"],
};

export default nextConfig;
