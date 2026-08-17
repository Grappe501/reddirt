import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";
import { OWNED_MEDIA_SERVER_ACTION_BODY_LIMIT } from "./src/lib/owned-media/limits";

const tracingRoot = path.dirname(fileURLToPath(import.meta.url));

/** Netlify / opposition-debate — shrink traced server artifacts (see netlify.toml). */
const oppositionDebateLaunch =
  process.env.NEXT_PUBLIC_INTELLIGENCE_LAUNCH_MODE === "opposition_debate";
const slimNetlifyTrace = oppositionDebateLaunch || Boolean(process.env.NETLIFY);

const oppositionDebateTraceExcludes = slimNetlifyTrace
  ? [
      "data/campaign-events/**",
      "data/compliance/**",
      "data/county-workbench/**",
      "data/election/**",
      "data/simulations/**",
      "data/intelligence/briefs/**",
      "docs/kelly-grappe-sos-strategic-plan-manual/**",
      "docs/strategic-plan/**",
      "campaign-system-manual/**",
      ".local/**",
      "**/.local/**",
      "**/npm-cache/**",
      "**/_cacache/**",
    ]
  : [];

/**
 * Default Next.js build so App Router API routes work on Netlify via @netlify/plugin-nextjs.
 */
const nextConfig: NextConfig = {
  /** Keep file tracing inside RedDirt — never the SOSWebsite monorepo sibling lanes. */
  outputFileTracingRoot: tracingRoot,
  /** Optional: legacy client env if you add Google Maps elsewhere; /events uses OpenStreetMap + Leaflet. */
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY:
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? process.env.GOOGLE_MAPS_API_KEY ?? "",
  },
  /** Hide the corner dev badge on a clean marketing hero; errors still surface in the overlay. */
  devIndicators: false,
  experimental: {
    /** Supabase session pooler (pool_size 15) — avoid EMAXCONNSESSION during parallel SSG. */
    staticGenerationMaxConcurrency: 2,
    serverActions: {
      /** Campaign-owned video/audio uploads — must be ≥ `ABSOLUTE_OWNED_MEDIA_MAX_BYTES` in `src/lib/owned-media/limits.ts`. */
      bodySizeLimit: OWNED_MEDIA_SERVER_ACTION_BODY_LIMIT,
    },
  },
  images: {
    ...(slimNetlifyTrace ? { unoptimized: true } : {}),
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.squarespace-cdn.com", pathname: "/content/**" },
      { protocol: "https", hostname: "static1.squarespace.com", pathname: "/**" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/about/stand-up-arkansas",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/about/community",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/events/bella-vista-senior-nwa-2026-08-18",
        destination: "/events/nwa-senior-democrats-fayetteville-2026-08-18",
        permanent: true,
      },
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
      /** Public alias — Victory Plan / Campaign Plan bookmarks → election-plan workbench. */
      {
        source: "/campaign-plan",
        destination: "/election-plan",
        permanent: true,
      },
      {
        source: "/campaign-plan/:path*",
        destination: "/election-plan/:path*",
        permanent: true,
      },
      {
        source: "/updates",
        destination: "/from-the-road",
        permanent: true,
      },
      {
        source: "/watch",
        destination: "/kelly-speaks",
        permanent: false,
      },
      /** Legacy debate prep bookmarks (missing `/intelligence` segment). */
      {
        source: "/admin/kim-hammer",
        destination: "/admin/intelligence/kim-hammer",
        permanent: false,
      },
      {
        source: "/admin/kim-hammer/:path*",
        destination: "/admin/intelligence/kim-hammer/:path*",
        permanent: false,
      },
      /** Canonical hub is `/messages` (Pass 06); alias for bookmarks and external links. */
      {
        source: "/conversations",
        destination: "/messages",
        permanent: true,
      },
      /** Campaign-owned demo/bookmark aliases → canonical briefing & volunteer URLs (same deploy). */
      {
        source: "/countyWorkbench",
        destination: "/county-briefings",
        permanent: false,
      },
      {
        source: "/distipope-briefing",
        destination: "/county-briefings/pope",
        permanent: false,
      },
      {
        source: "/dist-county-briefings",
        destination: "/county-briefings",
        permanent: false,
      },
      {
        source: "/volunteerPage",
        destination: "/get-involved#volunteer",
        permanent: false,
      },
      {
        source: "/my-plan",
        destination: "/priorities",
        permanent: false,
      },
      {
        source: "/the-peoples-voice",
        destination: "/direct-democracy",
        permanent: false,
      },
      /**
       * Pathway Honesty (KELLY-PUBLIC-PATHWAY-HONESTY-1.0):
       * Do not bait public CTAs into `/about`. Participation bookmarks must land on real participation paths.
       * Unfinished OS hubs soft-redirect to get-involved / start-a-local-team — never Meet Kelly.
       */
      {
        source: "/onboarding/power-of-5",
        destination: "/get-involved/bring-5",
        permanent: false,
      },
      {
        source: "/organizing-intelligence",
        destination: "/priorities",
        permanent: false,
      },
      {
        source: "/organizing-intelligence/:path*",
        destination: "/priorities",
        permanent: false,
      },
      {
        source: "/local-organizing",
        destination: "/start-a-local-team",
        permanent: false,
      },
      {
        source: "/local-organizing/:path*",
        destination: "/start-a-local-team",
        permanent: false,
      },
      {
        source: "/dashboard",
        destination: "/about",
        permanent: false,
      },
      /**
       * County command index is organizing OS — soft-gate marketing visitors to presence map.
       * `/counties/:slug` stays reachable (noindex) for field deep links.
       */
      {
        source: "/counties",
        destination: "/arkansas",
        permanent: false,
      },
      /** Operator intel tools are not marketing surfaces. */
      {
        source: "/counties/tools/campaign-brain",
        destination: "/arkansas",
        permanent: false,
      },
      {
        source: "/counties/tools/campaign-brain/:path*",
        destination: "/arkansas",
        permanent: false,
      },
      {
        source: "/counties/tools/public-narrative",
        destination: "/arkansas",
        permanent: false,
      },
      {
        source: "/counties/tools/public-narrative/:path*",
        destination: "/arkansas",
        permanent: false,
      },
      {
        source: "/counties/:slug/intelligence",
        destination: "/arkansas",
        permanent: false,
      },
      {
        source: "/counties/:slug/intelligence/:path*",
        destination: "/arkansas",
        permanent: false,
      },
      /**
       * Canonical public calendar is `/events`.
       * Preserve event slugs so detail bookmarks do not collapse to the index.
       */
      {
        source: "/campaign-calendar",
        destination: "/events",
        permanent: false,
      },
      {
        source: "/campaign-calendar/:slug",
        destination: "/events/:slug",
        permanent: false,
      },
    ];
  },
  /**
   * `readFile` under `docs/` and `campaign-system-manual/` is not always discovered by the server
   * dependency tracer. Without this, Netlify/Vercel serverless bundles can miss Markdown at runtime
   * (broken reader / chunk APIs). Keys are request path globs per Next.js `outputFileTracingIncludes`.
   *
   * Keep globs tight: the campaign manuals are large. Including them for every `/admin/**` route
   * balloons the Netlify `___netlify-server-handler` bundle (250 MB deploy cap).
   */
  outputFileTracingIncludes: oppositionDebateLaunch
    ? {
        "/admin/intelligence/**": [
          "./data/opposition/**",
          "./docs/opposition/**",
        ],
        "/admin/opposition/**": [
          "./data/opposition/**",
          "./docs/opposition/**",
        ],
        "/election-plan/**": [
          "./data/election-plan/**",
          "./data/campaign-brain/election-plan/**",
          "./data/campaign-brain/county-party-intelligence/**",
          "./data/campaign-brain/relational-organizing/power-of-5-command-center.source.json",
          "./docs/strategic-plan/plurality-victory-plan/**",
          "./data/cpos/**",
        ],
        "/api/election-plan/**": [
          "./data/election-plan/election-plan-search-index.json",
          "./data/campaign-brain/election-plan/page-briefs.source.json",
        ],
      }
    : {
        "/admin/campaign-strategy/**/*": [
          "./docs/kelly-grappe-sos-strategic-plan-manual/**/*",
          "./campaign-system-manual/**/*",
        ],
        "/api/admin/campaign-strategy/**/*": [
          "./docs/kelly-grappe-sos-strategic-plan-manual/**/*",
          "./campaign-system-manual/**/*",
        ],
        "/admin/intelligence/**": [
          "./docs/opposition/KIM_HAMMER_ELECTION_RECORD_RESEARCH_DOSSIER.md",
          "./docs/opposition/KIM_HAMMER_ELECTION_RECORD_CLAIMS_REVIEW.md",
          "./docs/opposition/KIM_HAMMER_ELECTION_RECORD_MESSAGE_GUIDANCE.md",
          "./docs/opposition/KIM_HAMMER_ELECTION_RECORD_BUILD_REPORT.md",
        ],
        "/admin/opposition/**": [
          "./docs/opposition/KIM_HAMMER_ELECTION_RECORD_RESEARCH_DOSSIER.md",
          "./docs/opposition/KIM_HAMMER_ELECTION_RECORD_CLAIMS_REVIEW.md",
          "./docs/opposition/KIM_HAMMER_ELECTION_RECORD_MESSAGE_GUIDANCE.md",
          "./docs/opposition/KIM_HAMMER_ELECTION_RECORD_BUILD_REPORT.md",
        ],
        "/admin/calendar-command-center/**": [
          "./data/calendar-command-center/event-volunteer-reminders.staged.json",
        ],
        "/admin/campaign-calendar/**": [
          "./data/calendar-command-center/event-volunteer-reminders.staged.json",
        ],
        "/election-plan/team-kickoff/**": ["./data/cpos/**"],
        "/election-plan/**": [
          "./data/election-plan/**",
          "./data/campaign-brain/election-plan/**",
        ],
        "/api/election-plan/**": [
          "./data/election-plan/election-plan-search-index.json",
          "./data/campaign-brain/election-plan/page-briefs.source.json",
        ],
        "/api/cpos/**": ["./data/cpos/**"],
      },
  /**
   * Netlify `___netlify-server-handler` must stay under AWS Lambda’s 250 MB (unzipped) cap.
   * The tracer otherwise pulls compile-only binaries (SWC), pdf-parse test PDFs/maps, Prisma
   * engines for other OS targets, and local upload trees that are gitignored but may exist on disk.
   */
  outputFileTracingExcludes: {
    // Route glob "**/*" matches all App/Pages routes (bare "*" is unreliable in trace apply).
    // Patterns are joined to the repo root by Next — use forward-slash forms that work on Netlify Linux.
    "**/*": [
      ".next/cache/**",
      "**/.next/cache/**",
      "cache/webpack/**",
      ".git/**",
      "**/.git/**",
      ".git/objects/**",
      "backups/**",
      ".tmp-heic-preview/**",
      "tsconfig.tsbuildinfo",
      "data/owned-campaign-media/**",
      "data/campaign-events/media/**",
      "data/compliance/imports/**",
      "data/intelligence/backups/**",
      /** Large staged calendar JSON — dynamic readFileSync otherwise ships in every Lambda (~4.5MB). */
      "data/calendar-command-center/**",
      /** Static assets — served from CDN/static, not the server handler. */
      "public/**",
      ...(oppositionDebateLaunch
        ? ["docs/kelly-grappe-sos-strategic-plan-manual/**", "campaign-system-manual/**"]
        : ["docs/**", "campaign-system-manual/**"]),
      /** Per-county factory JSON — dynamic readFileSync paths otherwise trace all 150+ files into one Lambda. */
      "data/county-workbench/briefs/**",
      "data/county-workbench/compiled-profiles/**",
      "data/county-workbench/tables/**",
      "data/intelligence/briefs/county/**",
      "node_modules/@next/swc-*/**",
      "node_modules/@img/sharp-win32-*/**",
      "node_modules/@img/sharp-darwin-*/**",
      "node_modules/@img/sharp-libvips-linuxmusl-x64/**",
      "node_modules/@img/sharp-linuxmusl-x64/**",
      "node_modules/.prisma/client/query_engine-windows.dll.node",
      "node_modules/.prisma/client/libquery_engine-darwin*.node",
      "node_modules/.prisma/client/libquery_engine-rhel-openssl-1.0.x.so.node",
      "node_modules/@swc/core-*/**",
      "node_modules/@esbuild/**",
      "node_modules/webpack/**",
      "node_modules/typescript/**",
      "node_modules/.cache/**",
      "node_modules/pdf-parse/**",
      "node_modules/@prisma/engines/**/windows/**",
      "node_modules/@prisma/engines/**/darwin/**",
      "node_modules/prisma/**/windows/**",
      "node_modules/prisma/**/darwin/**",
      ...oppositionDebateTraceExcludes,
      ".local/**",
      "**/.local/**",
      "**/npm-cache/**",
      "**/_cacache/**",
    ],
    "/api/owned-campaign-media/**": ["data/owned-campaign-media/**"],
  },
  // pdf-parse must stay external: its test harness references missing test/ PDFs and breaks the bundler.
  // Heavy server deps: keep traced server artifacts smaller for Netlify’s 250 MB function cap.
  serverExternalPackages: [
    "@prisma/client",
    "pdf-parse",
    "sharp",
    "@googleapis/gmail",
    "@googleapis/calendar",
    "@googleapis/people",
    "twilio",
    "openai",
    "mammoth",
    "xlsx",
  ],
};

export default nextConfig;
