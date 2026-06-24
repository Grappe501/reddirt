"use client";

import { usePathname } from "next/navigation";

import { EpSubnav } from "@/components/election-plan/ui/EpSubnav";
import {
  EP_DEBATE_PREP_ANATOMY_HREF,
  EP_DEBATE_PREP_HREF,
  EP_DEBATE_PREP_RESPONSES_HREF,
  EP_DEBATE_QUESTIONS_HREF,
  EP_LEGISLATIVE_INTEL_HREF,
  EP_VOTER_AUDIENCES_HREF,
  epDebatePrepDayHref,
} from "@/lib/election-plan/debate-prep-links";
import { DAY1_ID, DAY2_ID, DAY3_ID, DAY4_ID, DAY5_ID, DAY6_ID, DAY7_ID, DAY8_ID } from "@/lib/election-plan/debate-prep-day-ids";
import { showFullDebatePrepSubnav } from "@/lib/election-plan/kelly-facing-ui";

const studentCourseTabs = [
  { href: EP_DEBATE_PREP_HREF, label: "Course", exact: true as const },
  { href: EP_DEBATE_PREP_ANATOMY_HREF, label: "Anatomy" },
  { href: EP_DEBATE_PREP_RESPONSES_HREF, label: "Responses" },
  { href: epDebatePrepDayHref(DAY1_ID), label: "M1" },
  { href: epDebatePrepDayHref(DAY2_ID), label: "M2" },
  { href: epDebatePrepDayHref(DAY3_ID), label: "M3" },
  { href: epDebatePrepDayHref(DAY4_ID), label: "M4" },
  { href: epDebatePrepDayHref(DAY5_ID), label: "M5" },
  { href: epDebatePrepDayHref(DAY6_ID), label: "M6" },
  { href: epDebatePrepDayHref(DAY7_ID), label: "M7" },
  { href: epDebatePrepDayHref(DAY8_ID), label: "M8" },
  { href: EP_VOTER_AUDIENCES_HREF, label: "Audiences" },
  { href: EP_DEBATE_QUESTIONS_HREF, label: "Questions" },
  { href: EP_LEGISLATIVE_INTEL_HREF, label: "Bills" },
] as const;

const fullTabs = [
  { href: EP_DEBATE_PREP_HREF, label: "Hub", exact: true as const },
  { href: "/election-plan/debate-prep/war-room", label: "War room" },
  { href: EP_DEBATE_QUESTIONS_HREF, label: "40 questions" },
  { href: "/election-plan/debate-prep/opponent-bios", label: "Opponent bios" },
  { href: EP_LEGISLATIVE_INTEL_HREF, label: "Bills" },
  { href: EP_VOTER_AUDIENCES_HREF, label: "Audiences" },
  { href: "/election-plan/debate-prep/command", label: "Command home" },
  { href: "/election-plan/debate-prep/trap-lanes", label: "Trap lanes" },
  { href: "/election-plan/debate-prep/techniques", label: "Techniques" },
  { href: "/election-plan/debate-prep/tutor", label: "AI tutor" },
  { href: "/election-plan/debate-prep/rehearsal", label: "Rehearsal" },
  { href: "/election-plan/debate-prep/lanes", label: "Drill lanes" },
  { href: "/election-plan/debate-prep/forum-lab", label: "Forum lab" },
] as const;

export function ElectionPlanDebatePrepSubnav({ compact = false }: { compact?: boolean }) {
  const path = (usePathname() ?? EP_DEBATE_PREP_HREF).split("?")[0] ?? EP_DEBATE_PREP_HREF;
  const useCompact = compact || !showFullDebatePrepSubnav();
  const tabs = useCompact ? studentCourseTabs : fullTabs;

  return <EpSubnav tabs={tabs} activePath={path} ariaLabel="Debate prep sections" />;
}
