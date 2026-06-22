"use client";

import { usePathname } from "next/navigation";

import { EpSubnav } from "@/components/election-plan/ui/EpSubnav";
import {
  EP_DEBATE_PREP_COMMAND_HREF,
  EP_DEBATE_PREP_HREF,
  EP_DEBATE_PREP_WAR_ROOM_HREF,
  EP_LEGISLATIVE_INTEL_HREF,
  EP_VOTER_AUDIENCES_HREF,
  EP_OPPONENT_BIOS_HREF,
  EP_DEBATE_QUESTIONS_HREF,
  EP_FORUM_TRANSCRIPT_LAB_HREF,
  EP_DEBATE_PREP_TUTOR_HREF,
  EP_DEBATE_PREP_REHEARSAL_HREF,
  EP_DEBATE_PREP_LANES_HREF,
  EP_TRAP_LANES_HREF,
  EP_DEBATE_TECHNIQUES_HREF,
  epDebatePrepDayHref,
} from "@/lib/election-plan/debate-prep-links";
import { DAY1_ID, DAY2_ID, DAY3_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import { showFullDebatePrepSubnav } from "@/lib/election-plan/kelly-facing-ui";

const fullTabs = [
  { href: EP_DEBATE_PREP_HREF, label: "Hub", exact: true as const },
  { href: EP_DEBATE_PREP_WAR_ROOM_HREF, label: "War room" },
  { href: EP_DEBATE_QUESTIONS_HREF, label: "40 questions" },
  { href: EP_OPPONENT_BIOS_HREF, label: "Opponent bios" },
  { href: EP_LEGISLATIVE_INTEL_HREF, label: "Bills" },
  { href: EP_VOTER_AUDIENCES_HREF, label: "Audiences" },
  { href: EP_DEBATE_PREP_COMMAND_HREF, label: "Command home" },
  { href: EP_TRAP_LANES_HREF, label: "Trap lanes" },
  { href: EP_DEBATE_TECHNIQUES_HREF, label: "Techniques" },
  { href: EP_DEBATE_PREP_TUTOR_HREF, label: "AI tutor" },
  { href: EP_DEBATE_PREP_REHEARSAL_HREF, label: "Rehearsal" },
  { href: EP_DEBATE_PREP_LANES_HREF, label: "Drill lanes" },
  { href: EP_FORUM_TRANSCRIPT_LAB_HREF, label: "Forum lab" },
] as const;

const compactTabs = [
  { href: EP_DEBATE_PREP_HREF, label: "Hub", exact: true as const },
  { href: epDebatePrepDayHref(DAY1_ID), label: "Day 1" },
  { href: epDebatePrepDayHref(DAY2_ID), label: "Day 2" },
  { href: epDebatePrepDayHref(DAY3_ID), label: "Day 3" },
  { href: EP_VOTER_AUDIENCES_HREF, label: "Audiences" },
  { href: EP_LEGISLATIVE_INTEL_HREF, label: "Bills" },
  { href: EP_DEBATE_PREP_WAR_ROOM_HREF, label: "War room" },
  { href: EP_DEBATE_QUESTIONS_HREF, label: "Questions" },
] as const;

export function ElectionPlanDebatePrepSubnav({ compact = false }: { compact?: boolean }) {
  const path = (usePathname() ?? EP_DEBATE_PREP_HREF).split("?")[0] ?? EP_DEBATE_PREP_HREF;
  const useCompact = compact || !showFullDebatePrepSubnav();
  const tabs = useCompact ? compactTabs : fullTabs;

  return <EpSubnav tabs={tabs} activePath={path} ariaLabel="Debate prep sections" />;
}
