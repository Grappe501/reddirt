import { getVolunteerLeaderRoster, getEffectiveTeamLanes } from "@/lib/volunteers/leader-roster";
import { loadFieldEntryCountsByInitials } from "@/lib/election-plan/field-entry/load-field-entries";
import { loadCommunityWorkbench } from "@/lib/election-plan/community-workbench/load-workbench";
import { resolveLeaderGeographyScope, workbenchSlugsFromScope } from "@/lib/volunteers/leader-scope";
import { leaderWorkbenchHref } from "@/lib/volunteers/build-leader-workbench-v2";
import { VOLUNTEER_TEAM_LANES } from "@/lib/volunteers/types";

export type CommandHeatmapRow = {
  slug: string;
  displayName: string;
  initials: string;
  lanes: string[];
  fieldEntryQty: number;
  leadershipFilled: number;
  leadershipTotal: number;
  activity: "active" | "warming" | "quiet";
  workbenchHref: string;
};

function laneLabel(id: string): string {
  return VOLUNTEER_TEAM_LANES.find((l) => l.id === id)?.label ?? id;
}

export async function loadCommandCoverageHeatmap(): Promise<CommandHeatmapRow[]> {
  const roster = getVolunteerLeaderRoster();
  const fieldCounts = await loadFieldEntryCountsByInitials(roster.map((l) => l.initials));

  const slugToLeader = new Map<string, typeof roster>();
  for (const leader of roster) {
    const scope = resolveLeaderGeographyScope(leader);
    for (const slug of workbenchSlugsFromScope(scope)) {
      const list = slugToLeader.get(slug) ?? [];
      list.push(leader);
      slugToLeader.set(slug, list);
    }
  }

  const uniqueSlugs = [...slugToLeader.keys()];
  const workbenchLoads = await Promise.all(uniqueSlugs.map((slug) => loadCommunityWorkbench(slug)));
  const leadershipBySlug = new Map<string, { filled: number; total: number }>();
  uniqueSlugs.forEach((slug, i) => {
    const wb = workbenchLoads[i];
    if (!wb) {
      leadershipBySlug.set(slug, { filled: 0, total: 8 });
      return;
    }
    leadershipBySlug.set(slug, {
      filled: wb.leadership.filter((l) => l.personName?.trim()).length,
      total: wb.leadership.length,
    });
  });

  return roster.map((leader) => {
    const scope = resolveLeaderGeographyScope(leader);
    const slugs = workbenchSlugsFromScope(scope);
    let leadershipFilled = 0;
    let leadershipTotal = 0;
    for (const slug of slugs) {
      const row = leadershipBySlug.get(slug);
      if (row) {
        leadershipFilled += row.filled;
        leadershipTotal += row.total;
      }
    }

    const fieldEntryQty = fieldCounts[leader.initials.toUpperCase()] ?? 0;
    const activity: CommandHeatmapRow["activity"] =
      fieldEntryQty > 0 || leadershipFilled > 0 ? "active" : leadershipTotal > 0 ? "warming" : "quiet";

    return {
      slug: leader.slug,
      displayName: leader.displayName,
      initials: leader.initials,
      lanes: getEffectiveTeamLanes(leader).map(laneLabel),
      fieldEntryQty,
      leadershipFilled,
      leadershipTotal,
      activity,
      workbenchHref: leaderWorkbenchHref(leader.slug),
    };
  });
}
