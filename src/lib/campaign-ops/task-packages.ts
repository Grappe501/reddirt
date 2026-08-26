export const TASK_PACKAGE_METADATA_VERSION = 1 as const;

export type TaskPackageState = "OPEN" | "CLAIMED" | "IN_PROGRESS" | "SUBMITTED" | "VERIFIED" | "CHANGES_REQUESTED";
export type TaskPackageWorksheetValue = string | number | boolean | null;

export type TaskPackageProof = {
  id: string;
  label: string;
  url?: string | null;
  note?: string | null;
  addedAt: string;
  addedByUserId?: string | null;
};

export type TaskPackageMetadata = {
  version: typeof TASK_PACKAGE_METADATA_VERSION;
  state: TaskPackageState;
  objective?: string | null;
  instructions: string[];
  acceptanceCriteria: string[];
  worksheet: Record<string, TaskPackageWorksheetValue>;
  proof: TaskPackageProof[];
  dependencyTaskIds: string[];
  claimedByUserId?: string | null;
  claimedAt?: string | null;
  submittedByUserId?: string | null;
  submittedAt?: string | null;
  submissionNote?: string | null;
  verifiedByUserId?: string | null;
  verifiedAt?: string | null;
  verificationNote?: string | null;
  changesRequestedByUserId?: string | null;
  changesRequestedAt?: string | null;
  changesRequestedNote?: string | null;
};

export type CampaignTaskOpsMetadata = Record<string, unknown> & { taskPackage?: TaskPackageMetadata };

export const EMPTY_TASK_PACKAGE: TaskPackageMetadata = {
  version: TASK_PACKAGE_METADATA_VERSION,
  state: "OPEN",
  instructions: [],
  acceptanceCriteria: [],
  worksheet: {},
  proof: [],
  dependencyTaskIds: [],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v).trim()).filter(Boolean);
}

function nullableString(value: unknown): string | null | undefined {
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  return value.trim() || null;
}

export function readCampaignTaskOpsMetadata(value: unknown): CampaignTaskOpsMetadata {
  return isRecord(value) ? { ...value } : {};
}

export function readTaskPackageMetadata(value: unknown): TaskPackageMetadata | null {
  const root = readCampaignTaskOpsMetadata(value);
  const raw = root.taskPackage;
  if (!isRecord(raw)) return null;

  const allowedStates: TaskPackageState[] = ["OPEN", "CLAIMED", "IN_PROGRESS", "SUBMITTED", "VERIFIED", "CHANGES_REQUESTED"];
  const state = allowedStates.includes(raw.state as TaskPackageState) ? (raw.state as TaskPackageState) : "OPEN";
  const worksheet: Record<string, TaskPackageWorksheetValue> = {};
  if (isRecord(raw.worksheet)) {
    for (const [key, entry] of Object.entries(raw.worksheet)) {
      if (entry === null || typeof entry === "string" || typeof entry === "number" || typeof entry === "boolean") worksheet[key] = entry;
    }
  }

  const proof: TaskPackageProof[] = Array.isArray(raw.proof)
    ? raw.proof.flatMap((entry) => {
        if (!isRecord(entry) || typeof entry.id !== "string" || typeof entry.label !== "string") return [];
        return [{
          id: entry.id,
          label: entry.label,
          url: nullableString(entry.url),
          note: nullableString(entry.note),
          addedAt: typeof entry.addedAt === "string" ? entry.addedAt : new Date(0).toISOString(),
          addedByUserId: nullableString(entry.addedByUserId),
        }];
      })
    : [];

  return {
    version: TASK_PACKAGE_METADATA_VERSION,
    state,
    objective: nullableString(raw.objective),
    instructions: stringArray(raw.instructions),
    acceptanceCriteria: stringArray(raw.acceptanceCriteria),
    worksheet,
    proof,
    dependencyTaskIds: stringArray(raw.dependencyTaskIds),
    claimedByUserId: nullableString(raw.claimedByUserId),
    claimedAt: nullableString(raw.claimedAt),
    submittedByUserId: nullableString(raw.submittedByUserId),
    submittedAt: nullableString(raw.submittedAt),
    submissionNote: nullableString(raw.submissionNote),
    verifiedByUserId: nullableString(raw.verifiedByUserId),
    verifiedAt: nullableString(raw.verifiedAt),
    verificationNote: nullableString(raw.verificationNote),
    changesRequestedByUserId: nullableString(raw.changesRequestedByUserId),
    changesRequestedAt: nullableString(raw.changesRequestedAt),
    changesRequestedNote: nullableString(raw.changesRequestedNote),
  };
}

export function writeTaskPackageMetadata(rootValue: unknown, taskPackage: TaskPackageMetadata): CampaignTaskOpsMetadata {
  return { ...readCampaignTaskOpsMetadata(rootValue), taskPackage: { ...taskPackage, version: TASK_PACKAGE_METADATA_VERSION } };
}

export function initializeTaskPackageMetadata(input?: {
  objective?: string | null;
  instructions?: string[];
  acceptanceCriteria?: string[];
  dependencyTaskIds?: string[];
}): TaskPackageMetadata {
  return {
    ...EMPTY_TASK_PACKAGE,
    objective: input?.objective?.trim() || null,
    instructions: (input?.instructions ?? []).map((v) => v.trim()).filter(Boolean),
    acceptanceCriteria: (input?.acceptanceCriteria ?? []).map((v) => v.trim()).filter(Boolean),
    dependencyTaskIds: [...new Set((input?.dependencyTaskIds ?? []).map((v) => v.trim()).filter(Boolean))],
  };
}

export function taskPackageCanBeClaimed(pkg: TaskPackageMetadata): boolean {
  return pkg.state === "OPEN" || pkg.state === "CHANGES_REQUESTED";
}
export function taskPackageCanBeSubmitted(pkg: TaskPackageMetadata): boolean {
  return pkg.state === "CLAIMED" || pkg.state === "IN_PROGRESS" || pkg.state === "CHANGES_REQUESTED";
}
export function taskPackageCanBeVerified(pkg: TaskPackageMetadata): boolean {
  return pkg.state === "SUBMITTED";
}
