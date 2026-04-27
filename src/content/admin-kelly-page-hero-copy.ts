import type { PageKey } from "@/lib/content/page-blocks";

/** Shown at top of the hero editor. Client tracks visits separately (no DB). */
export const KELLY_EDITOR_EXPLANATION_INTRO =
  "This editor will explain more at first so nothing feels like a mystery. After you’ve seen how it works, explanations move behind short labels so this feels like a normal dashboard—without hiding where to find answers.";

/** localStorage key: incrementing visit count; first 3 visits = expanded field help, then collapsed. */
export const KELLY_EDITOR_EXPLANATION_VISIT_KEY = "kelly_editor_explanations_seen";

/** Kelly-facing: what this screen is, without internal jargon. */
export const KELLY_HERO_WELCOME =
  "This is where you change the top hero (eyebrow, main title, subtitle) for one public page. The rest of the page body still comes from the site’s code and content system until more editor tools are added. You always confirm twice before anything is written to the database.";

export const KELLY_HERO_WELCOME_COMPACT =
  "Hero text only, two confirm steps before save. Deeper page blocks are still code-defined.";

export const KELLY_HERO_WHY_DOUBLE_CONFIRM =
  "Two steps: first, review what will change. Second, confirm that you want the database updated. The site only updates if that second step succeeds in the server.";

export const heroFieldHelp: Record<
  "eyebrow" | "title" | "subtitle",
  { shortLabel: string; whyHere: string; whatItAffects: string }
> = {
  eyebrow: {
    shortLabel: "Eyebrow",
    whyHere: "A small line above the main title so people immediately see the theme (issue, series, or section).",
    whatItAffects: "The first line in the public hero. Empty is OK if you want a cleaner look.",
  },
  title: {
    shortLabel: "Title",
    whyHere: "The main heading people read first. It is the most visible line on the page.",
    whatItAffects: "The large headline in the public hero. This is the line most visitors will quote or remember.",
  },
  subtitle: {
    shortLabel: "Subtitle",
    whyHere: "A short support line under the title—clarifies the promise in one or two lines.",
    whatItAffects: "The paragraph directly under the headline on the public page. It frames how people read the rest of the page.",
  },
};

export function heroImpactBlurb(pageKey: PageKey, publicPath: string): string {
  return `These fields update only the hero block stored for this page in the database. The live URL is ${publicPath}. Other sections on the same page (cards, links, long copy) are not edited here. Staff can help you navigate this screen; the save still requires your two confirmations, and the campaign is not auto-publishing from Ask Kelly feedback.`;
}

export const KELLY_HERO_EMPTY_DB = {
  title: "No saved hero in the database yet",
  body: "The public page may still show default or code-based hero text. Saving here will create the hero block for this page. You can start with any combination of eyebrow, title, and subtitle.",
};

export const KELLY_ASK_KELLY_NOT_LINKED =
  "Ask Kelly beta feedback and other queues do not change this text automatically. This editor is a separate, deliberate save.";
