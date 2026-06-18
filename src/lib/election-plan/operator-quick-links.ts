/** Operator quick links — single source for War Room home and portal surfaces. */
import {
  EP_DEBATE_PREP_COMMAND_HREF,
  EP_DEBATE_PREP_HREF,
  EP_DEBATE_PREP_LANES_HREF,
  EP_DEBATE_PREP_REHEARSAL_HREF,
  EP_DEBATE_PREP_TUTOR_HREF,
  EP_EXECUTIVE_BOOK_HREF,
  EP_FORUM_TRANSCRIPT_LAB_HREF,
  EP_OPPOSITION_RESEARCH_HREF,
} from "@/lib/election-plan/debate-prep-links";

export type ElectionPlanQuickLink = {
  label: string;
  href: string;
  detail?: string;
  emphasis?: "gold" | "rose" | "default";
};

export type ElectionPlanQuickLinkGroup = {
  id: string;
  label: string;
  links: ElectionPlanQuickLink[];
};

export const ELECTION_PLAN_OPERATOR_QUICK_LINK_GROUPS: ElectionPlanQuickLinkGroup[] = [
  {
    id: "debate-prep-v5",
    label: "Debate prep · v5",
    links: [
      { label: "Debate prep hub", href: EP_DEBATE_PREP_HREF, detail: "Readiness + 7-day course", emphasis: "gold" },
      { label: "Command home", href: EP_DEBATE_PREP_COMMAND_HREF, detail: "Safe & blocked lines tonight" },
      { label: "AI tutor", href: EP_DEBATE_PREP_TUTOR_HREF, detail: "Coach + professor modes" },
      { label: "Rehearsal engine", href: EP_DEBATE_PREP_REHEARSAL_HREF, detail: "Encounters · drill queue · iPad" },
      { label: "Drill lanes", href: EP_DEBATE_PREP_LANES_HREF, detail: "Intensive v3 optional lanes" },
      { label: "Forum transcript lab", href: EP_FORUM_TRANSCRIPT_LAB_HREF, detail: "ACCA three-way panel · MP4 drop" },
    ],
  },
  {
    id: "research",
    label: "Research & narrative",
    links: [
      { label: "Opposition research", href: EP_OPPOSITION_RESEARCH_HREF, detail: "Kim Hammer · claims gate", emphasis: "rose" },
      { label: "Executive Book", href: EP_EXECUTIVE_BOOK_HREF, detail: "Leadership chapters · budget" },
      { label: "Portal search", href: "/election-plan/search", detail: "Find anything in the plan" },
    ],
  },
  {
    id: "field",
    label: "Field & strategy",
    links: [
      { label: "Intelligence opportunities", href: "/election-plan/intelligence-opportunities", detail: "Forward Motion ranked events" },
      { label: "Event approvals", href: "/election-plan/event-approvals", detail: "Calendar truth · Phase 9 lock" },
      { label: "Forward Motion", href: "/election-plan/forward-motion/master-plan", detail: "Master plan · stops" },
      { label: "Arkansas Battlefield", href: "/election-plan/battlefield", detail: "Clusters · VCI" },
      { label: "County playbooks", href: "/election-plan?tab=countyPlaybooks", detail: "75 counties · Ch.4 drop-off · Ch.5 reg" },
      { label: "Lanes overview", href: "/election-plan/lanes-overview", detail: "Four lanes drill-down" },
      { label: "Registration goals", href: "/election-plan/registration-goals", detail: "County registration targets" },
    ],
  },
  {
    id: "ops",
    label: "Operations",
    links: [
      { label: "Community workbenches", href: "/election-plan/workbenches", detail: "Local action frameworks" },
      { label: "Operators", href: "/election-plan/operators", detail: "Access & auth" },
      { label: "Leadership hub", href: "/election-plan/leadership", detail: "Weekly packet · matrix" },
      { label: "Campaign academy", href: "/election-plan/academy", detail: "Volunteer training" },
      { label: "Direct democracy", href: "/election-plan/direct-democracy", detail: "Platform · leadership" },
      { label: "Power of 5", href: "/election-plan/power-of-5/command-center", detail: "Conversation doctrine" },
    ],
  },
];
