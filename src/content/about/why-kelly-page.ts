/**
 * “Why Kelly” — first-layer Golden Circle (WHY / HOW / WHAT) for the Secretary of State race.
 * This is campaign positioning on why Kelly entered the race full-time, not literary biography.
 *
 * -----------------------------------------------------------------------------
 * INTERNAL VERIFICATION NOTES — do not paste into visible site copy:
 * - Research lead: DOJ began requesting statewide voter-registration lists from nearly
 *   every state in May 2025 — confirm scope, wording, and dates with primary sources
 *   before any public claim.
 * - Research lead: NCSL (and similar trackers) describe state responses on voter-list
 *   requests; verify whether Arkansas provided or committed to provide full lists and
 *   what fields were at issue—only cite with current primary documentation.
 * - Do not say “one of the first” (or other rank claims) unless campaign verifies with
 *   a primary source.
 * - Do not claim SSNs or specific sensitive fields were released unless verified with
 *   authoritative Arkansas-specific records and reporting.
 * -----------------------------------------------------------------------------
 */

export const whyKellyPageCopy = {
  hero: {
    title: "Why Kelly",
    subtitle: "Arkansas elections belong to Arkansans.",
  },

  why: {
    title: "Why",
    paragraphs: [
      "Kelly stepped fully into this race because she saw mounting pressure—here and nationally—to shift election decision-making away from state law and accountable state officials, and toward centralized or political convenience.",
      "Debates over mail ballots, registration rules, proof-of-name-change requirements for voters, and who can access voter-file data are not abstract. They land in county courthouses and Secretary of State systems that real Arkansans rely on. When those conversations turn careless, access narrows, privacy weakens, or public confidence frays—and fixing it afterward is harder than defending the line up front.",
      "The Secretary of State’s duty is to administer elections under Arkansas law: clearly, lawfully, and evenhandedly. That responsibility rests with the state—not with Washington, not with a party committee, and not with whoever shouts loudest in a national headline.",
    ] as const,
  },

  how: {
    title: "Hold the Line",
    paragraphs: [
      "Kelly will administer the office in a way that follows statute and rule—transparently, and without partisan favoritism in how processes are run or explained.",
      "She will protect both voter access and voter privacy: practical help for lawful ballots, and disciplined restraint when sensitive lists or data are requested.",
      "She will insist on clear legal authority before state election data is shared outside what Arkansas law and public accountability allow.",
      "She will work with counties in plain language—so clerks, commissioners, and voters can rely on the same fair description of the rules.",
    ] as const,
  },

  what: {
    title: "What you can count on",
    cards: [
      {
        title: "Protect free and fair elections",
        body: "Processes that are lawful, predictable, and applied without double standards—so the result is trusted because the administration was steady.",
      },
      {
        title: "Safeguard voter data and privacy",
        body: "Election administration holds sensitive records; those files deserve strict care, narrow sharing, and a high bar for any disclosure.",
      },
      {
        title: "Make the office transparent and understandable",
        body: "Public information and business services should be easy to navigate, with guidance that respects both the voter and the small-business filer.",
      },
    ] as const,
  },

  roadLine:
    "Kelly says it plainly on the road: Arkansas needs a Secretary of State who will hold the line.",
} as const;
