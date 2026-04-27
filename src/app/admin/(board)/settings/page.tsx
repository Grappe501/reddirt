import Link from "next/link";
import { prisma } from "@/lib/db";
import { saveSiteSettingsAction, triggerSubstackSyncAction } from "@/app/admin/actions";

type Props = { searchParams: Promise<{ saved?: string }> };

export default async function AdminSettingsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" } }).catch(() => null);

  const envFeed = process.env.SUBSTACK_FEED_URL?.trim() ?? "";
  const displaySite =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || settings?.canonicalSiteUrlNote?.trim() || "(set NEXT_PUBLIC_SITE_URL for production OG URLs)";

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-heading text-3xl font-bold text-kelly-text">Settings</h1>
      <p className="mt-3 font-body text-sm text-kelly-text/75">
        Environment variables win for secrets. This panel stores operational notes and optional feed overrides in the
        database.
      </p>
      {sp.saved ? (
        <p className="mt-4 rounded-lg border border-kelly-success/35 bg-kelly-success/10 px-3 py-2 text-sm">Saved.</p>
      ) : null}

      <section className="mt-10 space-y-3 rounded-card border border-kelly-text/10 bg-kelly-page p-6 shadow-[var(--shadow-soft)]">
        <h2 className="font-heading text-lg font-bold text-kelly-text">Canonical / public URL</h2>
        <p className="font-body text-sm text-kelly-text/75">
          Resolved for reference: <strong className="text-kelly-text">{displaySite}</strong>
        </p>
      </section>

      <section className="mt-8 space-y-3 rounded-card border border-kelly-text/10 bg-kelly-page p-6 shadow-[var(--shadow-soft)]">
        <h2 className="font-heading text-lg font-bold text-kelly-text">Substack sync status</h2>
        <p className="font-body text-sm text-kelly-text/75">
          <strong>Env SUBSTACK_FEED_URL:</strong> {envFeed || "— not set —"}
        </p>
        <p className="font-body text-sm text-kelly-text/75">
          <strong>Last sync:</strong>{" "}
          {settings?.lastSubstackSyncAt ? settings.lastSubstackSyncAt.toLocaleString("en-US") : "—"}
        </p>
        <p className="font-body text-sm text-kelly-text/75">
          <strong>OK:</strong> {settings?.lastSubstackSyncOk == null ? "—" : settings.lastSubstackSyncOk ? "Yes" : "No"}
        </p>
        {settings?.lastSubstackSyncError ? (
          <p className="rounded-md bg-kelly-navy/10 px-3 py-2 font-body text-sm text-kelly-navy">{settings.lastSubstackSyncError}</p>
        ) : null}
        <form action={triggerSubstackSyncAction}>
          <button type="submit" className="mt-2 rounded-btn border border-kelly-text/20 px-4 py-2 text-xs font-bold text-kelly-text">
            Trigger sync from server
          </button>
        </form>
        <p className="font-body text-xs text-kelly-text/55">
          {/* TODO: scheduled sync — wire a cron (e.g. Vercel cron, GitHub Action, or worker) to POST an authenticated sync endpoint on an interval. */}
          Scheduled sync is not wired in this pass. Add a cron job that hits a protected sync route when you are ready.
        </p>
      </section>

      <section className="mt-8 rounded-card border border-kelly-text/10 bg-kelly-page p-6 shadow-[var(--shadow-soft)]">
        <h2 className="font-heading text-lg font-bold text-kelly-text">Platform connectors</h2>
        <p className="mt-2 font-body text-sm text-kelly-text/75">
          Facebook, Instagram, and YouTube use server environment variables. See the reference table (no secrets stored
          in the admin UI).
        </p>
        <Link
          href="/admin/settings/platforms"
          className="mt-4 inline-block rounded-btn border border-kelly-text/20 px-4 py-2 text-sm font-semibold text-kelly-text"
        >
          Open platform settings →
        </Link>
      </section>

      <form action={saveSiteSettingsAction} className="mt-8 space-y-4 rounded-card border border-kelly-text/10 bg-kelly-page p-6 shadow-[var(--shadow-soft)]">
        <h2 className="font-heading text-lg font-bold text-kelly-text">Stored settings</h2>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Substack RSS URL (optional if env set)</span>
          <input
            name="substackFeedUrl"
            defaultValue={settings?.substackFeedUrl ?? ""}
            placeholder="https://yourpub.substack.com/feed"
            className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 font-mono text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Canonical site URL note</span>
          <textarea
            name="canonicalSiteUrlNote"
            rows={2}
            defaultValue={settings?.canonicalSiteUrlNote ?? ""}
            placeholder="Production domain for humans (OG tags use NEXT_PUBLIC_SITE_URL)"
            className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-kelly-text/55">Admin / integration notes</span>
          <textarea
            name="adminNotes"
            rows={4}
            defaultValue={settings?.adminNotes ?? ""}
            placeholder="Future: external organizing DB identifiers, API keys reminders, etc."
            className="mt-1 w-full rounded-md border border-kelly-text/15 bg-white px-3 py-2 text-sm"
          />
        </label>
        <button type="submit" className="rounded-btn bg-kelly-navy px-5 py-2.5 text-sm font-bold text-kelly-page">
          Save settings
        </button>
      </form>
    </div>
  );
}
