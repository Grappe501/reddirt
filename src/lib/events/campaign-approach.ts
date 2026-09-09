import type { ArchiveReason, CampaignApproach, EventItem } from "@/content/types";
import type { KellyCampaignStop } from "@/data/kelly-county-visits/types";

export type CampaignApproachDecision = {
  approach: CampaignApproach;
  reason?: ArchiveReason;
  note: string;
  ledgerIds?: string[];
};

/** First Steve pass — numbered against the 2026-09-06 upcoming list. */
export const CAMPAIGN_APPROACH_BY_SLUG: Record<string, CampaignApproachDecision> = {
  "washington-county-labor-event-2026": {
    approach: "removed",
    reason: "redundant",
    note: "Remove completely.",
    ledgerIds: ["manual-2026-09-07-washington-county-labor-event"],
  },
  "howard-county-nashville-sep-8-2026": {
    approach: "archive",
    reason: "never_confirmed",
    note: "Never confirmed.",
    ledgerIds: ["manual-2026-09-08-howard-county-nashville"],
  },
  "aac-county-clerks-fall-meeting-2026": {
    approach: "archive",
    reason: "never_confirmed",
    note: "Never confirmed.",
    ledgerIds: ["manual-2026-09-09-aac-county-clerks"],
  },
  "sherwood-chamber-military-2026": {
    approach: "archive",
    reason: "never_confirmed",
    note: "Never confirmed.",
    ledgerIds: ["manual-2026-09-10-sherwood-chamber-military"],
  },
  "ame-west-conference-magnolia-2026": {
    approach: "archive",
    reason: "never_confirmed",
    note: "Never confirmed.",
    ledgerIds: ["manual-2026-09-10-ame-west-conference"],
  },
  "sharp-county-hq-highland-2026": {
    approach: "archive",
    reason: "conflict",
    note: "Conflict.",
    ledgerIds: ["manual-2026-09-11-sharp-county-hq-highland"],
  },
  "dallas-county-fair-fordyce-2026-09-11": {
    approach: "archive",
    reason: "never_confirmed",
    note: "Never confirmed.",
    ledgerIds: ["presence-2026-09-11-fordyce-dallas-county-fair-6pm"],
  },
  "conway-county-fair-2026-09-12": {
    approach: "archive",
    reason: "never_confirmed",
    note: "Never confirmed.",
    ledgerIds: ["locked-2026-09-12-conway-county-fair"],
  },
  "harrison-hot-air-balloon-festival-2026": {
    approach: "archive",
    reason: "never_confirmed",
    note: "Never confirmed.",
    ledgerIds: ["presence-2026-09-12-harrison-hot-air-balloon-festival"],
  },
  "baxter-county-candidate-forum-2026-09-14": {
    approach: "archive",
    reason: "never_confirmed",
    note: "Never confirmed.",
    ledgerIds: ["presence-2026-09-14-mt-home-candidate-forum"],
  },
  "dunbar-gardens-garden-party-2026": {
    approach: "archive",
    reason: "never_confirmed",
    note: "Never confirmed.",
    ledgerIds: ["manual-2026-09-15-garden-party-dunbar"],
  },
  "pope-county-fair-russellville-2026": {
    approach: "removed",
    reason: "redundant",
    note: "Redundant with Dreami Tea / Count Me In the same week.",
    ledgerIds: ["locked-2026-09-15-pope-county-fair"],
  },
  "rogers-roundabout-crew-2026": {
    approach: "archive",
    reason: "never_confirmed",
    note: "Never confirmed.",
    ledgerIds: ["manual-2026-09-16-rogers-roundabout-crew"],
  },
  "karaoke-sep-16-2026": {
    approach: "archive",
    reason: "never_confirmed",
    note: "Never confirmed.",
    ledgerIds: ["manual-2026-09-16-karaoke"],
  },
  "camden-meet-the-candidates-forum-2026": {
    approach: "archive",
    reason: "never_confirmed",
    note: "Never confirmed.",
    ledgerIds: ["manual-2026-09-17-camden-meet-the-candidates"],
  },
  "calhoun-county-fair-2026-09-18": {
    approach: "archive",
    reason: "never_confirmed",
    note: "Never confirmed.",
    ledgerIds: ["presence-2026-09-18-calhoun-county-fair-evening"],
  },
  "baxter-fair-sep-18-2026": {
    approach: "archive",
    reason: "never_confirmed",
    note: "Never confirmed.",
    ledgerIds: ["manual-2026-09-18-baxter-fair"],
  },
  "cynthia-nations-fundraiser-sept-2026": {
    approach: "archive",
    reason: "never_confirmed",
    note: "Never confirmed.",
    ledgerIds: ["manual-2026-09-18-cynthia-nations-fundraiser"],
  },
  "little-rock-comic-con-2026-09-19": {
    approach: "archive",
    reason: "never_confirmed",
    note: "Never confirmed.",
    ledgerIds: ["locked-2026-09-18-arkansas-comic-con"],
  },
  "klek-jonesboro-candidate-interview-2026": {
    approach: "archive",
    reason: "never_confirmed",
    note: "Never confirmed.",
    ledgerIds: ["manual-2026-09-19-klek-jonesboro-interview"],
  },
  "rally-for-hallie-jonesboro-2026": {
    approach: "archive",
    reason: "never_confirmed",
    note: "Never confirmed.",
    ledgerIds: ["manual-2026-09-19-rally-for-hallie-jonesboro"],
  },
  "arkadelphia-sep-20-2026": {
    approach: "removed",
    reason: "redundant",
    note: "Redundant with the Clark County Multi-Church Tour.",
    ledgerIds: ["manual-2026-09-20-arkadelphia"],
  },
  "washington-county-rodeo-rally-2026": {
    approach: "removed",
    reason: "never_confirmed",
    note: "Never confirmed.",
    ledgerIds: ["manual-2026-09-22-rodeo-rally-washington"],
  },
  "press-freedom-gala-2026": {
    approach: "removed",
    reason: "conflict",
    note: "Steve 2026-09-08: Sep 22 is Howard County in Nashville.",
    ledgerIds: ["manual-2026-09-22-press-freedom-gala"],
  },
  "garland-library-county-candidates-forum-2026": {
    approach: "removed",
    reason: "conflict",
    note: "Steve 2026-09-08: Sep 22 is Howard County in Nashville. Library county night is not the SOS forum (that is Sep 29).",
    ledgerIds: ["manual-2026-09-22-garland-library-county-forum"],
  },
  "hot-springs-forum-2026-09-25": {
    approach: "removed",
    reason: "conflict",
    note: "Steve 2026-09-08: take the Sep 25 Hot Springs Forum off the public calendar.",
    ledgerIds: ["locked-2026-09-25-hot-springs-forum"],
  },
  "garland-library-hot-springs-city-forum-2026": {
    approach: "removed",
    reason: "never_confirmed",
    note: "Steve 2026-09-08: take the Sep 30 Hot Springs city library forum off the public calendar.",
    ledgerIds: ["manual-2026-09-30-garland-library-city-forum"],
  },
  "garland-library-state-federal-candidates-forum-2026": {
    approach: "removed",
    reason: "conflict",
    note: "Steve 2026-09-08: take Sep 29 State & Federal library forum off the public calendar.",
    ledgerIds: ["manual-2026-09-29-garland-library-state-federal-forum"],
  },
  "evening-with-acasa-2026": {
    approach: "removed",
    reason: "conflict",
    note: "Steve 2026-09-08: take Sep 29 Evening with ACASA off the public calendar.",
    ledgerIds: ["manual-2026-09-29-evening-with-acasa"],
  },
  "eddie-mae-herron-pocahontas-2026": {
    approach: "removed",
    reason: "conflict",
    note: "Steve 2026-09-08: take Sep 29 Eddie Mae Herron off the public calendar.",
    ledgerIds: ["manual-2026-09-29-eddie-mae-herron-pocahontas"],
  },
  "crittenden-prairie-arkansas-swing-2026-09-23": {
    approach: "removed",
    reason: "never_confirmed",
    note: "Never confirmed.",
    ledgerIds: ["presence-2026-09-23-crittenden-prairie-arkansas-county-swing"],
  },
  "owlfest-mcgehee-2026": {
    approach: "removed",
    reason: "never_confirmed",
    note: "Never confirmed.",
    ledgerIds: ["manual-2026-09-26-owlfest-mcgehee"],
  },
  "harrison-balloon-fest-2026-09-28": {
    approach: "removed",
    reason: "never_confirmed",
    note: "Bad information.",
    ledgerIds: ["locked-2026-09-28-harrison-balloon-fest"],
  },
  "dppc-gigis-rally-2026": {
    approach: "removed",
    reason: "conflict",
    note: "Conflict.",
    ledgerIds: ["manual-2026-09-28-dppc-gigis-rally"],
  },
  "cocktails-with-kelly-sep-2026": {
    approach: "removed",
    note: "Steve 2026-09-08: take off the public calendar.",
    ledgerIds: ["manual-2026-09-09-cocktails-with-kelly"],
  },
  "siloam-springs-chamber-forum-2026": {
    approach: "removed",
    reason: "conflict",
    note: "Conflict.",
    ledgerIds: ["manual-2026-10-01-siloam-springs-chamber-forum"],
  },
  "fun-on-31-yard-sales-2026": {
    approach: "removed",
    reason: "never_confirmed",
    note: "Steve 2026-09-08: take Fun on 31 off the public calendar.",
    ledgerIds: ["manual-2026-10-02-fun-on-31"],
  },
  "october-2-blocked-2026": {
    approach: "removed",
    reason: "redundant",
    note: "Steve 2026-09-08: Oct 1-2 is NAACP Convention (Steve attending).",
    ledgerIds: ["manual-2026-10-02-blocked"],
  },
  "people-over-politics-back-forty-2026": {
    approach: "removed",
    reason: "conflict",
    note: "Steve 2026-09-08: take Oct 3 Back Forty off the public calendar.",
    ledgerIds: ["manual-2026-10-03-people-over-politics-back-forty"],
  },
  "ozark-forward-fundraiser-oct-2026": {
    approach: "removed",
    reason: "conflict",
    note: "Steve 2026-09-08: take the Oct 3 Ozark Forward fundraiser hold off the public calendar.",
    ledgerIds: ["manual-2026-10-03-ozark-forward-fundraiser"],
  },
  "mountain-home-oct-4-5-2026": {
    approach: "removed",
    reason: "never_confirmed",
    note: "Steve 2026-09-08: take the Oct 4-5 Mountain Home hold off the public calendar.",
    ledgerIds: ["manual-2026-10-04-mountain-home-hold"],
  },
  "van-buren-moonshine-music-festival-2026-10-03": {
    approach: "removed",
    reason: "conflict",
    note: "Steve 2026-09-08: take Oct 3 Moonshine + Music Festival off the public calendar.",
    ledgerIds: ["presence-2026-10-03-moonshine-and-music-festival-at-fairgrounds-vbco"],
  },
  "berryville-meet-the-candidates-reloaded-2026": {
    approach: "removed",
    reason: "conflict",
    note: "Conflict.",
    ledgerIds: ["manual-2026-10-01-berryville-meet-the-candidates"],
  },
  "nlr-air-show-oct-3-2026": {
    approach: "removed",
    reason: "never_confirmed",
    note: "Never confirmed. Conflict.",
    ledgerIds: ["manual-2026-10-03-nlr-air-show"],
  },
  "ame-arkansas-conference-little-rock-2026": {
    approach: "removed",
    reason: "conflict",
    note: "Conflict.",
    ledgerIds: ["manual-2026-10-08-ame-arkansas-conference"],
  },
  "cross-county-farm-bureau-meet-the-candidates-2026": {
    approach: "removed",
    reason: "conflict",
    note: "Conflict.",
    ledgerIds: ["manual-2026-10-08-cross-county-farm-bureau"],
  },
  "king-biscuit-blues-festival-2026-10-09": {
    approach: "removed",
    reason: "never_confirmed",
    note: "Never confirmed.",
  },
  "naacp-pine-bluff-dove-banquet-2026": {
    approach: "removed",
    reason: "conflict",
    note: "Steve 2026-09-08: Oct 9 is OLLI for Coffee in Fayetteville.",
    ledgerIds: ["manual-2026-10-09-naacp-pine-bluff-dove-banquet"],
  },
  "october-daze-booneville-2026": {
    approach: "removed",
    reason: "conflict",
    note: "Steve 2026-09-08: take October Daze Booneville off the public calendar.",
    ledgerIds: ["manual-2026-10-10-october-daze-booneville"],
  },
  "montgomery-county-oct-10-2026": {
    approach: "removed",
    reason: "conflict",
    note: "Steve 2026-09-08: take the Oct 10 Montgomery County hold off the public calendar.",
    ledgerIds: ["presence-2026-10-10-montgomery-county"],
  },
  "saline-old-fashioned-2026": {
    approach: "removed",
    reason: "conflict",
    note: "Steve 2026-09-08: take Saline County Old Fashioned off the public calendar.",
    ledgerIds: ["manual-2026-10-10-saline-old-fashioned"],
  },
  "women-in-democracy-jonesboro-2026": {
    approach: "removed",
    reason: "conflict",
    note: "Steve 2026-09-08: take Women in Democracy Jonesboro off the public calendar.",
    ledgerIds: ["manual-2026-10-12-women-in-democracy-jonesboro"],
  },
  "rison-in-the-fall-2026": {
    approach: "removed",
    reason: "conflict",
    note: "Steve 2026-09-08: take Rison in the Fall off the public calendar.",
    ledgerIds: ["manual-2026-10-12-rison-in-the-fall"],
  },
  "saline-county-gotv-2026-10-12": {
    approach: "removed",
    reason: "conflict",
    note: "Steve 2026-09-08: take the Oct 12 Saline County GOTV Benton hold off the public calendar.",
    ledgerIds: ["locked-2026-10-12-saline-county-gotv-push"],
  },
  "vck-gotv-pep-rally-hot-springs-2026-10-20": {
    approach: "removed",
    reason: "conflict",
    note: "Steve 2026-09-08: take the VCK GOTV pep rally off the public calendar.",
    ledgerIds: ["manual-2026-10-20-vck-gotv-pep-rally"],
  },
  "early-voting-launch-2026-10-20": {
    approach: "removed",
    reason: "redundant",
    note: "Steve 2026-09-08: early voting begins October 19, not a Little Rock launch on October 20.",
    ledgerIds: ["locked-2026-10-20-early-voting-launch"],
  },
  "berryville-chamber-awards-banquet-2026": {
    approach: "removed",
    reason: "never_confirmed",
    note: "Steve 2026-09-08: take the Berryville Chamber awards banquet off the public calendar.",
    ledgerIds: ["manual-2026-10-22-berryville-chamber-awards"],
  },
  "hob-nob-bentonville-2026": {
    approach: "removed",
    reason: "conflict",
    note: "Conflict.",
    ledgerIds: ["manual-2026-10-15-hob-nob-bentonville"],
  },
  "hardy-candidate-forum-2026": {
    approach: "removed",
    reason: "conflict",
    note: "Conflict.",
    ledgerIds: ["manual-2026-10-15-hardy-candidate-forum"],
  },
  "rocky-comfort-pecan-festival-2026": {
    approach: "removed",
    reason: "conflict",
    note: "Steve 2026-09-08: Oct 16-18 is AYC youth retreat weekend in Little Rock.",
    ledgerIds: ["manual-2026-10-17-rocky-comfort-pecan-festival"],
  },
  "stuttgart-oct-17-2026": {
    approach: "removed",
    reason: "conflict",
    note: "Steve 2026-09-08: Oct 16-18 is AYC youth retreat weekend in Little Rock.",
    ledgerIds: ["manual-2026-10-17-stuttgart"],
  },
  "flat-rock-fish-fry-2026": {
    approach: "removed",
    reason: "conflict",
    note: "Steve 2026-09-08: Oct 16-18 is AYC youth retreat weekend in Little Rock.",
    ledgerIds: ["manual-2026-10-17-flat-rock-fish-fry"],
  },
  "uapb-homecoming-2026": {
    approach: "removed",
    reason: "conflict",
    note: "Steve 2026-09-08: Oct 16-18 is AYC youth retreat weekend in Little Rock.",
    ledgerIds: ["manual-2026-10-17-uapb-homecoming"],
  },
  "logan-scott-immersion-2026-10-18": {
    approach: "removed",
    reason: "conflict",
    note: "Steve 2026-09-08: Oct 16-18 is AYC youth retreat weekend in Little Rock.",
    ledgerIds: ["presence-2026-10-18-logan-and-scott-immersion"],
  },
  "petit-jean-meat-festival-2026": {
    approach: "removed",
    reason: "conflict",
    note: "Steve 2026-09-08: Oct 16-18 is AYC youth retreat weekend in Little Rock.",
    ledgerIds: ["presence-2026-10-18-petit-jean-meat-festival"],
  },
  "cindy-nations-rally-2026": {
    approach: "removed",
    reason: "conflict",
    note: "Conflict.",
    ledgerIds: ["manual-2026-10-22-cindy-nations-rally"],
  },
  "mountain-view-bean-fest-outhouse-races-2026": {
    approach: "removed",
    reason: "conflict",
    note: "Steve 2026-09-08: Oct 24 is Weston Colt birthday 2:00-6:00 p.m.",
    ledgerIds: ["manual-2026-10-24-mountain-view-outhouse-races"],
  },
  "lafayette-county-sep-2026": {
    approach: "removed",
    reason: "redundant",
    note: "Redundant county-day card. Removes the September 11 conflict.",
    ledgerIds: ["manual-2026-09-11-lafayette-county"],
  },
};

/** Empty — Steve 2026-09-08 took the September 29 four-way off except leftover cards he did not name. */
const CAUTION_SLUGS = new Set<string>([]);

export function campaignApproachForSlug(slug: string): CampaignApproachDecision | undefined {
  return CAMPAIGN_APPROACH_BY_SLUG[slug];
}

const DATE_LOCKS: Record<string, { startsAt: string; endsAt: string }> = {
  "le-vs-fire-softball-2026": {
    startsAt: "2026-09-11T19:00:00-05:00",
    endsAt: "2026-09-11T20:00:00-05:00",
  },
  "grassroots-guitar-strings-2026": {
    startsAt: "2026-09-17T18:30:00-05:00",
    endsAt: "2026-09-17T21:30:00-05:00",
  },
  "beatles-on-the-ridge-2026": {
    startsAt: "2026-09-19T09:00:00-05:00",
    endsAt: "2026-09-19T12:00:00-05:00",
  },
  "hot-spring-county-cookout-2026": {
    startsAt: "2026-09-19T17:00:00-05:00",
    endsAt: "2026-09-19T19:00:00-05:00",
  },
  "marche-day-2026": {
    startsAt: "2026-09-26T09:00:00-05:00",
    endsAt: "2026-09-26T12:00:00-05:00",
  },
  "greene-county-candidate-forum-2026-09-26": {
    startsAt: "2026-09-26T14:00:00-05:00",
    endsAt: "2026-09-26T16:00:00-05:00",
  },
  "lpga-northwest-arkansas-2026": {
    startsAt: "2026-09-27T09:00:00-05:00",
    endsAt: "2026-09-27T18:00:00-05:00",
  },
};

/** Steve 2026-09-08: these public stops are locked confirmed. */
const CONFIRMED_SLUGS = new Set([
  "faulkner-dems-hq-opening-2026",
  "russellville-mary-ella-voter-registration-2026",
  "hsv-candidate-forum-2026",
  "grassroots-guitar-strings-2026",
  "iclr-sep-18-2026",
  "beatles-on-the-ridge-2026",
  "hot-spring-county-cookout-2026",
  "clark-county-multi-church-tour-2026-09-20",
  "dequeen-sep-20-2026",
  "beckys-texarkana-2026-09-20",
  "marche-day-2026",
  "greene-county-candidate-forum-2026-09-26",
  "lpga-northwest-arkansas-2026",
  "drew-county-dems-sep-28-2026",
  "le-vs-fire-softball-2026",
  "howard-county-visit-nashville-2026-09-22",
  "hot-springs-chili-cookout-2026",
  "little-river-charlotte-sep-21-2026",
  "october-2-blocked-2026",
  "baxter-farm-bureau-oct-6-2026",
  "naacp-freedom-fund-gala-2026-10-03",
  "olli-for-coffee-2026",
  "fayetteville-fundraiser-2026-10-09",
  "early-voting-begins-2026-10-19",
]);

function withSept29Caution(event: EventItem): EventItem {
  if (!CAUTION_SLUGS.has(event.slug)) return event;
  return {
    ...event,
    fieldAttendance: "caution",
    organizerNote: `${event.organizerNote}\n\nSteve pass 2026-09-08: red caution. Four public stops on September 29 — confirm which one Kelly makes.`,
  };
}

function withConfirmed(event: EventItem): EventItem {
  if (!CONFIRMED_SLUGS.has(event.slug)) return event;
  if (event.campaignApproach === "removed" || event.campaignApproach === "archive") return event;
  return { ...event, fieldAttendance: "confirmed" };
}

export function applyCampaignApproach(event: EventItem): EventItem {
  const locked = DATE_LOCKS[event.slug];
  const next = locked ? { ...event, startsAt: locked.startsAt, endsAt: locked.endsAt } : event;
  const decision = CAMPAIGN_APPROACH_BY_SLUG[next.slug];
  if (!decision) return withConfirmed(withSept29Caution(next));
  if (decision.approach === "removed") {
    return {
      ...next,
      campaignApproach: "removed",
      archiveReason: decision.reason,
      fieldAttendance: "unscheduled",
      organizerNote: `${next.organizerNote}\n\nSteve pass 2026-09-07: removed from the public calendar. ${decision.note}`,
    };
  }
  if (decision.approach === "archive") {
    return {
      ...next,
      campaignApproach: "archive",
      archiveReason: decision.reason,
      fieldAttendance: "unscheduled",
      organizerNote: `${next.organizerNote}\n\nSteve pass 2026-09-07: archived. ${decision.note}`,
    };
  }
  return withConfirmed(withSept29Caution({ ...next, campaignApproach: decision.approach }));
}

export function isPublicCalendarEvent(event: EventItem): boolean {
  if (event.campaignApproach === "removed" || event.campaignApproach === "archive") return false;
  if (event.fieldAttendance === "suggested" || event.fieldAttendance === "unscheduled") return false;
  return true;
}

export function hideLedgerRowsForCampaignApproach(rows: KellyCampaignStop[]): KellyCampaignStop[] {
  const hide = new Set<string>();
  for (const decision of Object.values(CAMPAIGN_APPROACH_BY_SLUG)) {
    for (const id of decision.ledgerIds ?? []) hide.add(id);
  }
  return rows.map((row) => (hide.has(row.id) ? { ...row, includeOnPublicPage: false } : row));
}
