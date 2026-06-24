import { getVolunteerLeaderBySlug } from "@/lib/volunteers/leader-roster";
import {
  getVolunteerSessionFromCookies,
  requireFieldEntrySession,
} from "@/lib/volunteers/field-entry-access";
import { requireElectionPlanApiSession } from "@/lib/election-plan/auth/require-election-plan-api";

export async function requireLeaderRosterReadSession(): Promise<boolean> {
  if (await requireElectionPlanApiSession()) return true;
  return (await getVolunteerSessionFromCookies()) != null;
}

export async function resolveLeaderRosterEditor(): Promise<{
  leaderSlug: string;
  initials: string;
} | null> {
  const session = await getVolunteerSessionFromCookies();
  if (!session) return null;
  const leader = getVolunteerLeaderBySlug(session.leaderSlug);
  if (!leader || leader.initials.toUpperCase() !== session.initials.toUpperCase()) return null;
  return { leaderSlug: leader.slug, initials: leader.initials };
}

export async function canEditLeaderRoster(targetInitials: string): Promise<boolean> {
  const editor = await resolveLeaderRosterEditor();
  if (!editor) return false;
  return editor.initials.toUpperCase() === targetInitials.trim().toUpperCase();
}

export async function requireLeaderRosterEditor(targetInitials: string): Promise<
  | { error: "session"; editor: null }
  | { error: "forbidden"; editor: null }
  | { error: null; editor: { leaderSlug: string; initials: string } }
> {
  if (!(await requireFieldEntrySession())) {
    return { error: "session", editor: null };
  }
  const editor = await resolveLeaderRosterEditor();
  if (!editor) return { error: "session", editor: null };
  if (editor.initials.toUpperCase() !== targetInitials.trim().toUpperCase()) {
    return { error: "forbidden", editor: null };
  }
  return { error: null, editor };
}
