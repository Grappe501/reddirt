/**
 * Plain-language depth blocks — what to expect, attacks, adversity, stuck recovery, culture war.
 * Merged into operator guides and drill-downs at read time.
 */

export type DebateEncounterDepth = {
  /** One paragraph in plain English — what happens in this moment. */
  whatToExpectPlain: string;
  /** How Hammer (or moderator) will press — tone and tactics. */
  howHeWillAttack: string[];
  /** Step-by-step what Kelly does — calm, sourced, unity frame. */
  howToHandleIt: string[];
  /** Brain freeze, lost thread, moderator cuts you off. */
  ifYouGetHungUp: string[];
  /** Tough crowd, pile-on, booing, unfair framing — stay in service frame. */
  handlingAdversity: string[];
  /** Culture-war bait only — optional per surface. */
  cultureWarDefense?: string[];
};

export type DebateDepthTopic = {
  topicId: string;
  title: string;
  summary: string;
  href: string;
  estimatedMinutes: number;
  depth: DebateEncounterDepth;
  relatedLinks: Array<{ href: string; label: string }>;
};
