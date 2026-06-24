import Link from "next/link";

import { volunteerHubLogoutAction } from "@/lib/volunteers/auth/volunteer-auth-actions";
import { getVolunteerHubPassword } from "@/lib/volunteers/auth/session";

export function VolunteerHubLogoutButton() {
  if (!getVolunteerHubPassword()) return null;

  return (
    <form action={volunteerHubLogoutAction} className="ep-floating-action">
      <button type="submit" className="ep-btn ep-btn-ghost ep-btn-sm">
        Sign out
      </button>
    </form>
  );
}

type HeaderProps = {
  displayName: string;
  initials: string;
  commandAccess?: boolean;
};

export function VolunteerHubPortalHeader({ displayName, initials, commandAccess }: HeaderProps) {
  return (
    <header className="ep-portal-header">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 lg:px-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ep-gold)]">Volunteer Leader Hub</p>
          <h1 className="font-heading text-xl font-bold text-white">{displayName}</h1>
          <p className="text-sm text-white/70">
            Signed in as <span className="font-semibold text-[var(--ep-gold)]">{initials}</span>
          </p>
        </div>
        <nav className="flex flex-wrap items-center gap-2 text-sm">
          <Link href="/volunteers/me" className="ep-btn ep-btn-ghost ep-btn-sm">
            My workbench
          </Link>
          {commandAccess ? (
            <Link href="/volunteers/command" className="ep-btn ep-btn-ghost ep-btn-sm">
              Command view
            </Link>
          ) : null}
          <Link href="/election-plan" className="ep-btn ep-btn-ghost ep-btn-sm">
            Election Plan
          </Link>
        </nav>
      </div>
    </header>
  );
}
