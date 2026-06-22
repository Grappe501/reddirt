import { electionPlanLogoutAction } from "@/lib/election-plan/auth/election-plan-auth-actions";
import { getElectionPlanPassword } from "@/lib/election-plan/auth/session";

export function ElectionPlanLogoutButton() {
  if (!getElectionPlanPassword()) return null;

  return (
    <form action={electionPlanLogoutAction} className="ep-floating-action">
      <button type="submit" className="ep-btn ep-btn-ghost ep-btn-sm">
        Sign out
      </button>
    </form>
  );
}
