import Link from "next/link";

import { signInRelationalUserAction } from "../session-actions";

type Props = { searchParams: Promise<{ error?: string; next?: string }> };

export const dynamic = "force-dynamic";

export default async function RelationalLoginPage({ searchParams }: Props) {
  const sp = await searchParams;
  const err = sp.error;
  return (
    <div className="max-w-md space-y-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-kelly-navy/80">REL-3</p>
        <h1 className="mt-1 font-heading text-2xl font-bold">Organizer sign-in</h1>
        <p className="mt-2 text-sm text-kelly-text/75">
          Enter the email on your campaign account. This sign-in is for organizers; use a private
          device. No password in this version — tighten in a later auth packet.
        </p>
      </div>
      {err ? (
        <p className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {err === "unknown" && "No user found with that email."}
          {err === "email" && "Email is required."}
          {err === "config" && "Server is not configured (set RELATIONAL_USER_SESSION_SECRET or ADMIN_SECRET)."}
          {err && !["unknown", "email", "config"].includes(err) && err}
        </p>
      ) : null}
      <form action={signInRelationalUserAction} className="space-y-4 rounded-card border border-kelly-text/10 bg-kelly-page p-6">
        <input type="hidden" name="next" value={sp.next ?? "/relational"} />
        <label className="block text-sm">
          <span className="text-[10px] font-bold uppercase tracking-wide text-kelly-text/55">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded border border-kelly-text/15 px-3 py-2 text-sm"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded bg-kelly-navy px-4 py-2.5 text-sm font-semibold text-kelly-page hover:opacity-95"
        >
          Continue
        </button>
      </form>
      <p className="text-center text-sm">
        <Link href="/" className="text-kelly-navy underline-offset-2 hover:underline">
          Back to site
        </Link>
      </p>
    </div>
  );
}
