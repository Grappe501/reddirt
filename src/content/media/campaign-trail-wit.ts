import type { CampaignTrailPhoto } from "@/content/media/campaign-trail-photos";

/**
 * Humorous, campaign-themed captions for trail stills. Survives `photos:sync` rewrites to `campaign-trail-photos.ts`.
 * `trailPhotoWittyCaption` uses explicit UI overrides first, then this map, then registry `caption`, then a stable generic line.
 */
const BY_ID: Record<string, string> = {
  "001-img-2824":
    "Matching democracy shirts at the Capitol—proof that bipartisanship starts with coordinating laundry.",
  "002-img-4103":
    "The Capitol in black and white; the talking points, regrettably, still in full color.",
  "003-img-6860":
    "Meta moment: campaigning about a campaign page… displayed on another campaign page. Very modern politics.",
  "004-img-6925":
    "The official portrait booth—one place in politics where everyone actually smiles on purpose.",
  "005-img-7286":
    "The glamorous side of democracy: neon forms, folding tables, and a porta-potty photobomb.",
  "006-img-7385":
    "Lobbying, Arkansas-style: eye contact, honesty, and the occasional oink for emphasis.",
  "007-img-7385-1":
    "Some call it retail politics; out here we call it a snout-to-snout policy discussion.",
  "008-img-7852":
    "Practicing ‘people over politics’ in front of the banner—because message discipline starts with matching the scenery.",
  "009-img-7948":
    "The handshake: politics’ oldest file format—still no patch needed after all these years.",
  "010-img-7949":
    "Networking—where democracy learns everyone’s name tag and forgets half of them by dessert.",
  "011-img-7950":
    "Direct democracy, frosted three ways. If only every committee meeting came with cake.",
  "012-img-7953":
    "Capitol selfie rule: longest arms hold the phone; shortest patience holds the jokes.",
  "013-img-7954":
    "Outdoor office hours at the Capitol—where the Wi‑Fi is spotty but the constituent feedback is HD.",
  "014-img-7955":
    "Drive-through democracy: sign here, smile for the camera, and mind the curb.",
  "015-img-7956":
    "Gym-floor politics: fewer podiums, more pep-rally energy, and a sign nobody can dodge.",
  "016-img-7957":
    "Shepherding voters is a metaphor—until the lambs are literal and demand snacks.",
  "017-img-7958":
    "Finally, a flock that understands ‘talking turkey’ is supposed to be productive.",
  "018-img-7959":
    "This constituent never filibusters—just asks for belly rubs and bipartisan treats.",
  "019-img-7961":
    "When your field team says ‘we need more capes,’ check whether they mean volunteers or metaphors.",
  "020-img-7962":
    "‘We farm. You eat.’—the shortest farm bill explainer ever stitched onto a T-shirt.",
  "021-insta-social-sos-teamplate":
    "The campaign’s ‘studio polish’ shot—where the only mud is metaphorical (usually).",
};

const GENERIC_WIT = [
  "Trail wisdom: show up early, stay late, and never trust a parking spot that looks too convenient.",
  "Politics is just committee work with better signage and worse coffee.",
  "If your shoes are clean, you’re not campaigning—you’re commuting.",
  "Democracy runs on paperwork, patience, and the sacred right to complain in line.",
  "Campaign tip: the best focus group is whoever’s already in the room.",
  "Retail politics—because ‘wholesale opinions’ are how we got into this mess.",
  "Every county has two things: a courthouse rumor and someone who’ll tell you the real story.",
  "The secret platform is simple: listen first, filibuster never, snacks optional.",
] as const;

function stableIndex(id: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return mod > 0 ? h % mod : 0;
}

/**
 * Caption shown under trail photography. Explicit `override` wins (page-specific jokes, etc.).
 */
export function trailPhotoWittyCaption(
  photo: Pick<CampaignTrailPhoto, "id" | "caption">,
  override?: string | null,
): string {
  const o = override?.trim();
  if (o) return o;
  const mapped = BY_ID[photo.id];
  if (mapped) return mapped;
  const fromRegistry = photo.caption?.trim();
  if (fromRegistry) return fromRegistry;
  return GENERIC_WIT[stableIndex(photo.id, GENERIC_WIT.length)];
}
