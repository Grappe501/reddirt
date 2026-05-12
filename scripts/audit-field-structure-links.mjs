#!/usr/bin/env node
/**
 * Static audit: confirm audited dashboard + volunteer routes exist under `src/app/(site)`.
 * Run from RedDirt: `node scripts/audit-field-structure-links.mjs`
 *
 * This does not crawl the site or verify runtime redirects — only filesystem presence for App Router pages.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.join(__dirname, "..", "src", "app", "(site)");

/** Paths relative to `src/app/(site)` that must exist as files or directories with `page.tsx`. */
const REQUIRED_SITE_PAGES = [
  "volunteer/page.tsx",
  "volunteer/resources/page.tsx",
  "volunteer/resources/glossary/page.tsx",
  "volunteer/resources/faq/page.tsx",
  "volunteer/resources/email-templates/page.tsx",
  "volunteer/resources/messaging/page.tsx",
  "volunteer/resources/team-launch-kit/page.tsx",
  "volunteer/resources/social-media-design/page.tsx",
  "volunteer/resources/youth-outreach/page.tsx",
  "volunteer/resources/muslim-community/page.tsx",
  "volunteer/resources/county-party-launch-kit/page.tsx",
  "volunteer/resources/events-lane/page.tsx",
  "field-playbook/[[...path]]/page.tsx",
  "resources/volunteer/page.tsx",
  "dashboard/field/page.tsx",
  "dashboard/field/regions/page.tsx",
  "dashboard/field/regions/[regionId]/page.tsx",
  "dashboard/field/leads/social-media/page.tsx",
  "dashboard/field/leads/power-of-5/page.tsx",
  "dashboard/field/leads/events/page.tsx",
  "dashboard/community/page.tsx",
  "dashboard/community/muslim/page.tsx",
  "dashboard/community/conversational-spanish/page.tsx",
  "dashboard/community/marshallese/page.tsx",
  "dashboard/community/county-democrats/page.tsx",
  "dashboard/community/county-democrats/[countySlug]/page.tsx",
  "dashboard/team/[teamSlug]/page.tsx",
  "dashboard/team/[teamSlug]/social-media/page.tsx",
  "dashboard/team/[teamSlug]/events/page.tsx",
  "dashboard/team/[teamSlug]/power-of-5/page.tsx",
  "dashboard/team/[teamSlug]/youth-outreach/page.tsx",
  "dashboard/team/[teamSlug]/fundraising/page.tsx",
  "dashboard/team/[teamSlug]/training/page.tsx",
  "dashboard/team/[teamSlug]/metrics/page.tsx",
  "dashboard/team/[teamSlug]/resources/page.tsx",
  "dashboard/team/[teamSlug]/messages/page.tsx",
];

function exists(rel) {
  return fs.existsSync(path.join(siteRoot, rel));
}

let failed = 0;
for (const rel of REQUIRED_SITE_PAGES) {
  if (!exists(rel)) {
    console.error(`MISSING: ${rel}`);
    failed += 1;
  }
}

if (failed) {
  console.error(`\nAudit failed: ${failed} missing route file(s) under src/app/(site)/`);
  process.exit(1);
}

console.log(`OK — ${REQUIRED_SITE_PAGES.length} audited route files present under src/app/(site)/`);
