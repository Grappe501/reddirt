import Link from "next/link";
import { WhatToSayPanel } from "@/components/message-engine";
import { PowerOf5PipelineVisualization } from "@/components/power-of-5/PowerOf5PipelineVisualization";
import { GlossaryTerm } from "@/components/teaching/GlossaryTerm";
import { buildPersonalGamificationFromDemo } from "@/lib/power-of-5/gamification";
import { PERSONAL_DASHBOARD_DEMO } from "@/lib/power-of-5/personal-dashboard-demo";
import { GamificationPanel } from "./GamificationPanel";
import { MyFivePanel } from "./MyFivePanel";
import { MyTeamPanel } from "./MyTeamPanel";
import { MyImpactPanel } from "./MyImpactPanel";
import { MessageHubLinkCard } from "@/components/integrations/MessageHubLinkCard";
import { MyTasksPanel } from "./MyTasksPanel";

/**
 * Full-width volunteer-facing preview — demo data only until auth and live tiles ship.
 */
export function PersonalDashboardView() {
  const d = PERSONAL_DASHBOARD_DEMO;
  const gamification = buildPersonalGamificationFromDemo(d);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 text-kelly-text md:py-10">
      <div className="rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 dark:border-amber-500/35 dark:bg-amber-950/45 dark:text-amber-50">
        <strong>Demo mode:</strong> All names, counts, and dates are synthetic — safe for screenshots and reviews. Nothing here reads from accounts,
        voter files, or production <GlossaryTerm term="powerOf5">Power of 5</GlossaryTerm> data.
      </div>

      <header className="mt-8 border-b border-kelly-navy/10 pb-6">
        <p className="text-sm text-kelly-text/60">
          <Link className="text-kelly-slate underline" href="/">
            Home
          </Link>
          {" · "}
          <Link className="text-kelly-slate underline" href="/organizing-intelligence">
            Organizing intelligence
          </Link>
          {" · "}
          <Link className="text-kelly-slate underline" href="/dashboard/leader">
            Leadership preview
          </Link>
        </p>
        <h1 className="font-heading mt-3 text-3xl font-bold text-kelly-navy md:text-4xl">Volunteer preview</h1>
        <p className="mt-2 max-w-3xl text-sm text-kelly-text/75">
          A public-facing look at how your Power of 5 circle, team cadence, conversation log, and follow-ups fit together —
          illustrative only; designed for cooperative momentum, not public leaderboards.
        </p>
      </header>

      <PowerOf5PipelineVisualization className="mt-8" variant="full" activeId="volunteer" />

      <GamificationPanel snapshot={gamification} className="mt-10" />

      <WhatToSayPanel className="mt-10" />

      <MessageHubLinkCard
        className="mt-8"
        title="Weekly line & missions shelf"
        description={
          <>
            The hub carries the <strong>message of the week</strong>, county story cards, and printable-style share packets — alongside the What to Say
            tools above. Same demo registry; use it when you want the full narrative shelf in one scroll.
          </>
        }
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:gap-10">
        <MyFivePanel members={d.myFive} />
        <MyTeamPanel team={d.team} />
        <MyImpactPanel impact={d.impact} />
        <MyTasksPanel followUps={d.followUps} conversations={d.recentConversations} />
      </div>
    </div>
  );
}
