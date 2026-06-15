/**
 * Sync June 28 founding volunteer invite list into people-power-network + operations doc.
 *
 * Usage: npm run campaign-brain:volunteer-invites:sync
 */

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { BRAIN_DATA, BRAIN_ROOT, readJson } from "./lib/inputs";

const SOURCE = path.join(BRAIN_DATA, "founding-volunteer-invite-list.source.json");
const PEOPLE_POWER = path.join(BRAIN_DATA, "people-power-network.json");
const OUT_MD = path.join(BRAIN_ROOT, "operations/june-28-volunteer-launch-invite-list.md");

type Invitee = {
  id: string;
  displayName: string;
  locationHint: string | null;
  inviteStatus: string;
  confirmedFoundingTeam: boolean;
};

function main() {
  const source = readJson<{
    launchCall: { date: string; time: string; timezone: string; format: string; purpose: string };
    invitees: Invitee[];
  }>(SOURCE);

  if (!source?.invitees?.length) {
    throw new Error("No invitees in founding-volunteer-invite-list.source.json");
  }

  const invitees = source.invitees;
  const confirmed = invitees.filter((i) => i.confirmedFoundingTeam).length;

  const peoplePower = readJson<Record<string, unknown>>(PEOPLE_POWER) ?? {};
  const vl = (peoplePower.volunteerLeadership as Record<string, unknown>) ?? {};

  peoplePower.volunteerLeadership = {
    ...vl,
    foundingTeamGoal: 20,
    foundingTeamCurrent: confirmed,
    foundingTeamInvited: invitees.length,
    launchCall: source.launchCall,
    leaders: invitees.map((i) => ({
      id: i.id,
      name: i.displayName,
      locationHint: i.locationHint,
      countyAssignment: null,
      rolePreference: null,
      inviteStatus: i.inviteStatus,
      confirmedFoundingTeam: i.confirmedFoundingTeam,
    })),
  };

  writeFileSync(PEOPLE_POWER, JSON.stringify(peoplePower, null, 2));

  mkdirSync(path.dirname(OUT_MD), { recursive: true });

  const md = `# June 28 Volunteer Launch — Invite List

> **${source.launchCall.date}** · ${source.launchCall.time} ${source.launchCall.timezone} · ${source.launchCall.format}

**Purpose:** ${source.launchCall.purpose}

**Listed:** ${invitees.length} · **Confirmed founding team:** ${confirmed} / 20 goal

County assignments and role preferences — capture **at the meeting**.

| Name | Location hint | Invite status | Founding team |
|------|---------------|---------------|---------------|
${invitees.map((i) => `| ${i.displayName} | ${i.locationHint ?? "—"} | ${i.inviteStatus} | ${i.confirmedFoundingTeam ? "Yes" : "—"} |`).join("\n")}

---

Edit \`data/campaign-brain/founding-volunteer-invite-list.source.json\` · sync with \`npm run campaign-brain:volunteer-invites:sync\`
`;

  writeFileSync(OUT_MD, md);

  writeFileSync(
    path.join(BRAIN_ROOT, "operations/june-28-volunteer-launch-invite-list.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        launchCall: source.launchCall,
        inviteCount: invitees.length,
        confirmedFoundingTeam: confirmed,
        foundingTeamGoal: 20,
        invitees,
      },
      null,
      2,
    ),
  );

  console.log(`Volunteer invite sync: ${invitees.length} listed · ${confirmed} confirmed founding team`);
}

main();
