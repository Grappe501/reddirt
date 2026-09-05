/**
 * Public /events cards taken off the list on 2026-09-04.
 * Rows stay in their EventItem and ledger files. This is the restore index.
 *
 * To put a card back:
 * 1. Set fieldAttendance to restoreAttendance on the slug.
 * 2. Set includeOnPublicPage to true on ledgerId.
 */
export type UnpublishedPublicCard = {
  slug: string;
  ledgerId: string;
  title: string;
  date: string;
  restoreAttendance: "confirmed" | "tentative";
};

export const PUBLIC_CALENDAR_UNPUBLISH_ARCHIVE: UnpublishedPublicCard[] = [
  { slug: "paloma-hispanic-festival-2026", ledgerId: "manual-2026-09-05-paloma-hispanic-festival", title: "Paloma Community Hispanic Festival", date: "2026-09-05", restoreAttendance: "tentative" },
  { slug: "washington-county-labor-event-2026", ledgerId: "manual-2026-09-07-washington-county-labor-event", title: "Washington County labor event", date: "2026-09-07", restoreAttendance: "tentative" },
  { slug: "aac-county-clerks-fall-meeting-2026", ledgerId: "manual-2026-09-09-aac-county-clerks", title: "County Clerks Association fall meeting", date: "2026-09-09", restoreAttendance: "tentative" },
  { slug: "dallas-county-fair-fordyce-2026-09-11", ledgerId: "presence-2026-09-11-fordyce-dallas-county-fair-6pm", title: "Dallas County Fair — Fordyce", date: "2026-09-11", restoreAttendance: "confirmed" },
  { slug: "sharp-county-hq-highland-2026", ledgerId: "manual-2026-09-11-sharp-county-hq-highland", title: "Sharp County Democrats HQ opening", date: "2026-09-11", restoreAttendance: "tentative" },
  { slug: "baxter-county-candidate-forum-2026-09-14", ledgerId: "presence-2026-09-14-mt-home-candidate-forum", title: "Mountain Home candidate forum", date: "2026-09-14", restoreAttendance: "tentative" },
  { slug: "camden-meet-the-candidates-forum-2026", ledgerId: "manual-2026-09-17-camden-meet-the-candidates", title: "Camden Meet the Candidates", date: "2026-09-17", restoreAttendance: "tentative" },
  { slug: "calhoun-county-fair-2026-09-18", ledgerId: "presence-2026-09-18-calhoun-county-fair-evening", title: "Calhoun County Fair", date: "2026-09-18", restoreAttendance: "tentative" },
  { slug: "baxter-fair-sep-18-2026", ledgerId: "manual-2026-09-18-baxter-fair", title: "Baxter County Fair", date: "2026-09-18", restoreAttendance: "tentative" },
  { slug: "arkadelphia-sep-20-2026", ledgerId: "manual-2026-09-20-arkadelphia", title: "Arkadelphia hold", date: "2026-09-20", restoreAttendance: "tentative" },
  { slug: "washington-county-rodeo-rally-2026", ledgerId: "manual-2026-09-22-rodeo-rally-washington", title: "Washington County rodeo rally", date: "2026-09-22", restoreAttendance: "tentative" },
  { slug: "crittenden-prairie-arkansas-swing-2026-09-23", ledgerId: "presence-2026-09-23-crittenden-prairie-arkansas-county-swing", title: "Crittenden, Prairie, and Arkansas County swing", date: "2026-09-23", restoreAttendance: "confirmed" },
  { slug: "owlfest-mcgehee-2026", ledgerId: "manual-2026-09-26-owlfest-mcgehee", title: "Owl Fest — McGehee", date: "2026-09-26", restoreAttendance: "tentative" },
  { slug: "harrison-balloon-fest-2026-09-28", ledgerId: "locked-2026-09-28-harrison-balloon-fest", title: "Harrison Balloon Fest", date: "2026-09-28", restoreAttendance: "tentative" },
  { slug: "dppc-gigis-rally-2026", ledgerId: "manual-2026-09-28-dppc-gigis-rally", title: "Pulaski County Democrats — Countdown to Victory", date: "2026-09-28", restoreAttendance: "tentative" },
  { slug: "evening-with-acasa-2026", ledgerId: "manual-2026-09-29-evening-with-acasa", title: "An Evening with ACASA", date: "2026-09-29", restoreAttendance: "confirmed" },
  { slug: "siloam-springs-chamber-forum-2026", ledgerId: "manual-2026-10-01-siloam-springs-chamber-forum", title: "Siloam Springs Chamber candidate forum", date: "2026-10-01", restoreAttendance: "tentative" },
  { slug: "berryville-meet-the-candidates-reloaded-2026", ledgerId: "manual-2026-10-01-berryville-meet-the-candidates", title: "Berryville Chamber Meet the Candidates", date: "2026-10-01", restoreAttendance: "confirmed" },
  { slug: "people-over-politics-back-forty-2026", ledgerId: "manual-2026-10-03-people-over-politics-back-forty", title: "People Over Politics — Back Forty", date: "2026-10-03", restoreAttendance: "confirmed" },
  { slug: "nlr-air-show-oct-3-2026", ledgerId: "manual-2026-10-03-nlr-air-show", title: "North Little Rock Air Show", date: "2026-10-03", restoreAttendance: "tentative" },
  { slug: "mountain-home-oct-4-5-2026", ledgerId: "manual-2026-10-04-mountain-home-hold", title: "Mountain Home hold", date: "2026-10-04", restoreAttendance: "tentative" },
  { slug: "cross-county-farm-bureau-meet-the-candidates-2026", ledgerId: "manual-2026-10-08-cross-county-farm-bureau", title: "Cross County Farm Bureau Meet the Candidates", date: "2026-10-08", restoreAttendance: "tentative" },
  { slug: "king-biscuit-blues-festival-2026-10-09", ledgerId: "presence-2026-10-07-phillips-lee-monroe-immersion-anchor-is-king-bisquit-blues-festival", title: "King Biscuit Blues Festival", date: "2026-10-09", restoreAttendance: "confirmed" },
  { slug: "naacp-pine-bluff-dove-banquet-2026", ledgerId: "manual-2026-10-09-naacp-pine-bluff-dove-banquet", title: "NAACP Pine Bluff Dove Freedom Fund Banquet", date: "2026-10-09", restoreAttendance: "tentative" },
  { slug: "saline-old-fashioned-2026", ledgerId: "manual-2026-10-10-saline-old-fashioned", title: "Saline County Old Fashioned", date: "2026-10-10", restoreAttendance: "tentative" },
  { slug: "montgomery-county-oct-10-2026", ledgerId: "presence-2026-10-10-montgomery-county", title: "Montgomery County hold", date: "2026-10-10", restoreAttendance: "tentative" },
  { slug: "saline-county-gotv-2026-10-12", ledgerId: "locked-2026-10-12-saline-county-gotv-push", title: "Saline County GOTV push — Benton", date: "2026-10-12", restoreAttendance: "tentative" },
  { slug: "rison-in-the-fall-2026", ledgerId: "manual-2026-10-12-rison-in-the-fall", title: "Rison in the Fall", date: "2026-10-12", restoreAttendance: "tentative" },
  { slug: "hob-nob-bentonville-2026", ledgerId: "manual-2026-10-15-hob-nob-bentonville", title: "Hob Nob at Joint Business After Hours", date: "2026-10-15", restoreAttendance: "tentative" },
  { slug: "hardy-candidate-forum-2026", ledgerId: "manual-2026-10-15-hardy-candidate-forum", title: "Sharp County candidate forum — Hardy", date: "2026-10-15", restoreAttendance: "tentative" },
  { slug: "rocky-comfort-pecan-festival-2026", ledgerId: "manual-2026-10-17-rocky-comfort-pecan-festival", title: "Rocky Comfort Pecan Festival — Foreman", date: "2026-10-17", restoreAttendance: "tentative" },
  { slug: "flat-rock-fish-fry-2026", ledgerId: "manual-2026-10-17-flat-rock-fish-fry", title: "Flat Rock Hwy 359 fire department fish fry", date: "2026-10-17", restoreAttendance: "tentative" },
  { slug: "logan-scott-immersion-2026-10-18", ledgerId: "presence-2026-10-18-logan-and-scott-immersion", title: "Logan and Scott immersion", date: "2026-10-18", restoreAttendance: "confirmed" },
  { slug: "petit-jean-meat-festival-2026", ledgerId: "presence-2026-10-18-petit-jean-meat-festival", title: "Petit Jean Meat Festival", date: "2026-10-18", restoreAttendance: "tentative" },
];
