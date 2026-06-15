import { electionPlanLogoutAction } from "@/lib/election-plan/auth/election-plan-auth-actions";
import { getElectionPlanPassword } from "@/lib/election-plan/auth/session";

export function ElectionPlanLogoutButton() {
  if (!getElectionPlanPassword()) return null;

  return (
    <form action={electionPlanLogoutAction} className="fixed bottom-4 right-4 z-50">
      <button
        type="submit"
        className="rounded-full border border-[var(--ep-border)] bg-white/95 px-4 py-2 text-xs font-semibold text-[var(--ep-navy-muted)] shadow-md backdrop-blur hover:text-[var(--ep-navy)]"
      >
        Sign out
      </button>
    </form>
  );
}
