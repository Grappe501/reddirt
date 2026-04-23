/**
 * Short, human “whispers”—everyday humor, not stump-speech jokes.
 * Use under heroes, in footers, near forms, etc. Keeps the site approachable without diluting policy copy.
 */

export const FOOTER_WHISPERS = [
  "Built with caffeine, spell-check, and Arkansas stubbornness.",
  "Yes, we proofread the footer. Mostly.",
  "If something’s broken, it’s a person-shaped bug—we’ll fix it.",
  "Mobile-friendly, because nobody thumbs a novel in the Dairy Queen parking lot for fun.",
  "Dark mode for the nav; optimism for the state.",
] as const;

/** Stable for a given UTC calendar day (footer SSR + client match). */
export function siteFooterWhisper(): string {
  const d = new Date();
  const seed = d.getUTCFullYear() * 400 + d.getUTCMonth() * 40 + d.getUTCDate();
  const i = seed % FOOTER_WHISPERS.length;
  return FOOTER_WHISPERS[i]!;
}

export const TRUST_RIBBON_WHISPER =
  "Serious work. Serious coffee. Occasionally both in the same cup holder.";

export const PATHWAY_GRID_WHISPER =
  "If you landed here by accident, you’re still ahead of the average bounce rate. Pull up a chair.";

export const GET_INVOLVED_WHISPER =
  "P.S. Folding chairs are infrastructure. So is a decent thermos.";

export const JOIN_FORM_WHISPER =
  "Humans read these submissions—bots still can’t spell “Ouachita.”";

export const FROM_THE_ROAD_WHISPER =
  "Trail snacks not included; civic pride ships free.";

export const SEARCH_INPUT_WHISPER =
  "Try clerks, volunteer, or ballot—we’ll do our best not to answer with a mystery PDF.";

export const CAMPAIGN_GUIDE_OPENING = `I’m the site guide—I only know what the campaign has loaded into my homework, but that’s supposed to cover pretty much everything published here: Kelly’s story, the Secretary of State’s office, ballot access, priorities, events, how to help—you name it. Browse and use links all you want; I can point you to the right page. If you’re here for a straight answer about Kelly or this race, fire away. Stump me? Email kelly@kellygrappe.com with what you were looking for. (No, I still can’t register your boat—wrong office, same patience.) What’s on your mind?`;
