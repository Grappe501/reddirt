import { prisma } from "@/lib/db";

const RELATIONAL_TABLE_KEYS = [
  "RelationalContact",
  "VoterInteraction",
  "VoterVotePlan",
  "VolunteerProfile",
  "Commitment",
  "ContactPreference",
  "EmailContactProfile",
] as const;

export type RelationalOrganizingTableKey = (typeof RELATIONAL_TABLE_KEYS)[number];

function sqlIdentPublicTable(s: string): boolean {
  return /^[a-zA-Z0-9_]+$/.test(String(s));
}

async function tableExistsInPublic(table: string): Promise<boolean> {
  if (!sqlIdentPublicTable(table)) return false;
  try {
    const rows = await prisma.$queryRawUnsafe<Array<{ e: boolean }>>(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '${table}') AS e`,
    );
    const r = Array.isArray(rows) ? rows[0] : rows;
    return Boolean(r?.e);
  } catch {
    return false;
  }
}

export type RelationalOrganizingReadinessSnapshot = {
  databaseReachable: boolean;
  tables: Record<RelationalOrganizingTableKey, boolean>;
  peopleGraphAvailable: boolean;
  readiness: {
    manualRelationshipEntryReady: boolean;
    volunteerFollowUpReady: boolean;
    voterContactOutcomeReady: boolean;
    countyAssignmentReady: boolean;
  };
};

/**
 * Read-only relational organizing table presence. No imports, no writes.
 */
export async function getRelationalOrganizingReadinessSnapshot(): Promise<RelationalOrganizingReadinessSnapshot> {
  const tables = {} as Record<RelationalOrganizingTableKey, boolean>;
  let databaseReachable = true;
  for (const t of RELATIONAL_TABLE_KEYS) {
    try {
      tables[t] = await tableExistsInPublic(t);
    } catch {
      databaseReachable = false;
      tables[t] = false;
    }
  }

  const peopleGraphAvailable =
    tables.RelationalContact === true &&
    tables.VolunteerProfile === true &&
    (tables.VoterInteraction === true || tables.VoterVotePlan === true);

  const manualRelationshipEntryReady =
    tables.RelationalContact === true && tables.VolunteerProfile === true;
  const volunteerFollowUpReady = tables.Commitment === true && tables.VolunteerProfile === true;
  const voterContactOutcomeReady = tables.VoterInteraction === true || tables.VoterVotePlan === true;
  const countyAssignmentReady = tables.VolunteerProfile === true;

  return {
    databaseReachable,
    tables,
    peopleGraphAvailable,
    readiness: {
      manualRelationshipEntryReady,
      volunteerFollowUpReady,
      voterContactOutcomeReady,
      countyAssignmentReady,
    },
  };
}
