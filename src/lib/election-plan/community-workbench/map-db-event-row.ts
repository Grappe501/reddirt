import type { CommunityWorkbenchEventRow } from "./types";

function parseJsonArray<T>(raw: string | null | undefined, fallback: T[]): T[] {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function mapDbEventToRow(
  e: {
    id: string;
    title: string;
    eventDate: Date | null;
    location: string | null;
    expectedAttendance: number | null;
    actualAttendance: number | null;
    leadName: string | null;
    status: string;
    committeeId: string | null;
    runOfShowJson: string | null;
    assignmentsJson: string | null;
    documentsJson: string | null;
    aarBody: string | null;
    operatorInitials: string | null;
    updatedAt: Date;
  },
  committeeName: string | null,
): CommunityWorkbenchEventRow {
  return {
    id: e.id,
    title: e.title,
    eventDate: e.eventDate?.toISOString() ?? null,
    location: e.location,
    expectedAttendance: e.expectedAttendance,
    actualAttendance: e.actualAttendance,
    leadName: e.leadName,
    status: e.status,
    committeeId: e.committeeId,
    committeeName,
    runOfShow: parseJsonArray(e.runOfShowJson, []),
    assignments: parseJsonArray(e.assignmentsJson, []),
    documents: parseJsonArray(e.documentsJson, []),
    aarBody: e.aarBody,
    operatorInitials: e.operatorInitials,
    updatedAt: e.updatedAt.toISOString(),
  };
}
