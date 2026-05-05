import Link from "next/link";
import {
  buildSendGridContactExportPreview,
  getSendGridFoundationSnapshot,
  listRecentSendGridEvents,
  listSendGridAudienceReadiness,
  listSendGridSuppressionSummary,
  mapAudienceDefinitionToSendGridPayloadPreview,
} from "@/lib/email-command-center/sendgrid-foundation";

export const dynamic = "force-dynamic";

function labelHuman(
  k: "draft_only" | "preview_ready" | "active_preview_ready" | "archived"
): string {
  const m: Record<string, string> = {
    draft_only: "Draft only",
    preview_ready: "Preview-ready",
    active_preview_ready: "Active (not synced)",
    archived: "Archived",
  };
  return m[k] ?? k;
}

export default async function SendGridFoundationPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const previewId = typeof sp.preview === "string" ? sp.preview : undefined;

  const snap = await getSendGridFoundationSnapshot();
  const audiences = snap.dbReachable ? await listSendGridAudienceReadiness() : [];
  const events = snap.dbReachable ? await listRecentSendGridEvents(35) : [];
  const supSummary = snap.dbReachable ? await listSendGridSuppressionSummary() : [];

  const exportPreview = previewId && snap.dbReachable ? await buildSendGridContactExportPreview(previewId).catch(() => null) : null;
  const payloadPreview =
    previewId && snap.dbReachable ? await mapAudienceDefinitionToSendGridPayloadPreview(previewId).catch(() => null) : null;

  return (
    <div className="min-w-0 max-w-5xl space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/admin/workbench/email-command-center"
          className="rounded border border-kelly-text/15 bg-white px-2 py-0.5 text-xs font-semibold text-kelly-slate"
        >
          ← Email Command Center
        </Link>
        <Link href="/admin/workbench/email-command-center/audiences" className="text-xs text-kelly-text/60 hover:underline">
          Audience Studio
        </Link>
      </div>

      <header>
        <h1 className="font-heading text-xl font-bold text-kelly-navy">SendGrid Foundation</h1>
        <p className="mt-1 max-w-3xl font-body text-sm text-kelly-text/85">
          EMAIL-SENDGRID-FOUNDATION-1.0 — readiness, governance, and webhook intake rails.{" "}
          <strong>No email sends</strong>, no automatic contact sync, no campaigns, no OpenAI from this surface.
        </p>
      </header>

      {!snap.dbReachable ? (
        <div className="rounded-lg border border-amber-300/60 bg-amber-50/90 px-3 py-2 font-body text-[11px] text-amber-950">
          SendGrid foundation tables unreachable — run{" "}
          <code className="text-[10px]">npx prisma migrate deploy</code> when <code className="text-[10px]">DATABASE_URL</code> is
          healthy. <code className="text-[10px]">npm run check</code> alone does not prove migrations.
        </div>
      ) : null}

      <section className="rounded-lg border border-rose-300/50 bg-rose-50/80 px-3 py-2">
        <h2 className="font-heading text-[10px] font-bold uppercase tracking-wide text-rose-950">Governance</h2>
        <ul className="mt-1 list-inside list-disc font-body text-[11px] text-rose-950/95">
          <li>No sends from this page — queue flag stays false.</li>
          <li>No live contact sync to SendGrid — previews are local SQL only.</li>
          <li>Suppressions from webhooks must be honored before any future send packet.</li>
          <li>Domain authentication + sender identity are launch gates in SendGrid (manual checklist).</li>
        </ul>
      </section>

      <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-kelly-text/10 bg-white/90 p-3">
          <p className="font-heading text-[10px] font-bold uppercase text-kelly-text/50">API key</p>
          <p className="mt-1 font-heading text-lg font-bold text-kelly-navy">{snap.env.sendgridApiKeyPresent ? "Set" : "Missing"}</p>
          <p className="mt-0.5 font-body text-[10px] text-kelly-text/65">Env name only: SENDGRID_API_KEY</p>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white/90 p-3">
          <p className="font-heading text-[10px] font-bold uppercase text-kelly-text/50">From identity</p>
          <p className="mt-1 font-heading text-lg font-bold text-kelly-navy">
            {snap.readiness.fromIdentityReady ? "Ready" : "Incomplete"}
          </p>
          <p className="mt-0.5 font-body text-[10px] text-kelly-text/65">SENDGRID_FROM_EMAIL, SENDGRID_FROM_NAME</p>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white/90 p-3">
          <p className="font-heading text-[10px] font-bold uppercase text-kelly-text/50">Webhook verification</p>
          <p className="mt-1 font-heading text-lg font-bold text-kelly-navy">
            {snap.readiness.webhookVerificationReady ? "Configured" : "Missing"}
          </p>
          <p className="mt-0.5 font-body text-[10px] text-kelly-text/65">
            SENDGRID_WEBHOOK_VERIFICATION_KEY or SENDGRID_WEBHOOK_PUBLIC_KEY (PEM)
          </p>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-kelly-page/50 p-3">
          <p className="font-heading text-[10px] font-bold uppercase text-kelly-text/50">Event webhook route</p>
          <p className="mt-1 font-mono text-[10px] font-bold text-kelly-navy">{snap.webhook.eventWebhookPath}</p>
          <p className="mt-0.5 font-body text-[10px] text-kelly-text/65">POST only · configure URL in SendGrid Event Webhook settings.</p>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-kelly-page/50 p-3">
          <p className="font-heading text-[10px] font-bold uppercase text-kelly-text/50">Domain authentication</p>
          <p className="mt-1 font-heading text-sm font-bold text-kelly-navy">Manual checklist</p>
          <p className="mt-0.5 font-body text-[10px] text-kelly-text/65">
            Complete sender authentication in SendGrid; this app does not auto-verify DNS without a governed packet.
          </p>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-kelly-page/50 p-3">
          <p className="font-heading text-[10px] font-bold uppercase text-kelly-text/50">Comms legacy webhook</p>
          <p className="mt-1 font-mono text-[10px] text-kelly-navy">{snap.webhook.legacyCommsWebhookPath}</p>
          <p className="mt-0.5 font-body text-[10px] text-kelly-text/65">Workbench path unchanged — separate from Email OS foundation intake.</p>
        </div>
      </section>

      <section className="rounded-lg border border-kelly-text/10 bg-white/90 p-3">
        <h2 className="font-heading text-sm font-bold text-kelly-navy">Audience sync readiness (planning)</h2>
        <p className="mt-1 font-body text-[10px] text-kelly-text/70">
          All audiences remain <strong>not synced</strong> to SendGrid in this packet — status reflects preview posture only.
        </p>
        <div className="mt-2 max-h-64 overflow-auto rounded border border-kelly-text/10">
          <table className="w-full text-left text-[10px]">
            <thead className="sticky top-0 bg-kelly-fog/80 text-kelly-text/70">
              <tr>
                <th className="px-2 py-1">Audience</th>
                <th className="px-2 py-1">Status</th>
                <th className="px-2 py-1">SendGrid readiness</th>
                <th className="px-2 py-1">Map sync</th>
                <th className="px-2 py-1">Preview</th>
              </tr>
            </thead>
            <tbody>
              {audiences.map((a) => (
                <tr key={a.audienceDefinitionId} className="border-t border-kelly-text/10">
                  <td className="px-2 py-1 font-semibold text-kelly-navy">{a.name}</td>
                  <td className="px-2 py-1">{a.status}</td>
                  <td className="px-2 py-1">{labelHuman(a.sendGridReadinessLabel)}</td>
                  <td className="px-2 py-1">{a.audienceMapSyncStatus ?? "—"}</td>
                  <td className="px-2 py-1">
                    <Link
                      href={`/admin/workbench/email-command-center/sendgrid?preview=${encodeURIComponent(a.audienceDefinitionId)}`}
                      className="font-bold text-kelly-forest underline"
                    >
                      Export preview
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!audiences.length ? (
            <p className="p-2 text-[10px] text-kelly-text/55">No audience definitions — create drafts in Audience Studio.</p>
          ) : null}
        </div>
      </section>

      {exportPreview ? (
        <section className="rounded-lg border border-kelly-forest/25 bg-emerald-50/40 p-3">
          <h2 className="font-heading text-sm font-bold text-kelly-navy">Contact export preview (local SQL)</h2>
          <p className="mt-1 font-body text-[10px] text-kelly-text/80">
            Audience: <span className="font-bold">{exportPreview.audienceName}</span> · Match count{" "}
            <span className="tabular-nums font-bold">{exportPreview.matchCount}</span> · With primary email{" "}
            <span className="tabular-nums font-bold">{exportPreview.profilesWithPrimaryEmail}</span> · Missing email{" "}
            <span className="tabular-nums font-bold">{exportPreview.missingPrimaryEmail}</span> · Overlap with local
            suppressions <span className="tabular-nums font-bold">{exportPreview.suppressedInLocalTableApprox}</span>
          </p>
          <ul className="mt-2 list-inside list-disc font-body text-[10px] text-kelly-text/80">
            {exportPreview.governanceNotes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <p className="mt-2 font-heading text-[10px] font-bold text-kelly-text/60">Redacted sample rows</p>
          <ul className="mt-1 space-y-0.5 font-mono text-[9px] text-kelly-text/75">
            {exportPreview.sampleRows.map((r) => (
              <li key={r.profileId}>
                {r.profileId} · domain {r.emailDomainHint ?? "—"} · suppressed={String(r.suppressed)}
              </li>
            ))}
          </ul>
        </section>
      ) : previewId ? (
        <p className="rounded border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] text-rose-900">Preview failed or audience not found.</p>
      ) : null}

      {payloadPreview ? (
        <section className="rounded-lg border border-kelly-text/10 bg-white/90 p-3">
          <h2 className="font-heading text-sm font-bold text-kelly-navy">SendGrid payload shape (dry JSON)</h2>
          <p className="mt-1 font-body text-[10px] text-kelly-text/70">{payloadPreview.description}</p>
          <pre className="mt-2 max-h-56 overflow-auto rounded border border-kelly-text/10 bg-kelly-page/60 p-2 font-mono text-[9px] leading-snug text-kelly-navy">
            {JSON.stringify(payloadPreview.payload, null, 2)}
          </pre>
        </section>
      ) : null}

      <section className="grid gap-2 lg:grid-cols-2">
        <div className="rounded-lg border border-kelly-text/10 bg-white/90 p-3">
          <h2 className="font-heading text-sm font-bold text-kelly-navy">Webhook event health</h2>
          <p className="mt-1 font-body text-[10px] text-kelly-text/70">
            Recent rows in <code className="text-[9px]">SendGridEvent</code> (newest first).
          </p>
          <ul className="mt-2 max-h-52 space-y-1 overflow-auto font-mono text-[9px] text-kelly-text/85">
            {events.map((e) => (
              <li key={e.id}>
                {e.occurredAt.toISOString()} · {e.eventType} · id…{e.id.slice(0, 8)}
              </li>
            ))}
          </ul>
          {!events.length && snap.dbReachable ? (
            <p className="mt-2 text-[10px] text-kelly-text/55">No events ingested yet — wire SendGrid to POST signed batches.</p>
          ) : null}
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-white/90 p-3">
          <h2 className="font-heading text-sm font-bold text-kelly-navy">Suppression summary</h2>
          <ul className="mt-2 space-y-1 font-body text-[11px] text-kelly-text/85">
            {supSummary.map((s) => (
              <li key={s.type}>
                <span className="font-semibold">{s.type}</span> — <span className="tabular-nums">{s.count}</span>
              </li>
            ))}
          </ul>
          {!supSummary.length && snap.dbReachable ? (
            <p className="mt-2 text-[10px] text-kelly-text/55">No suppression rows yet.</p>
          ) : null}
        </div>
      </section>

      <section className="rounded-lg border border-kelly-text/10 bg-kelly-page/40 p-3 font-body text-[10px] text-kelly-text/80">
        <p className="font-bold text-kelly-navy">Foundation counts (DB)</p>
        <p className="mt-1">
          SendGridEvent: <span className="tabular-nums font-semibold">{snap.counts.sendGridEventsTotal}</span> ·
          SendGridSuppression: <span className="tabular-nums font-semibold">{snap.counts.sendGridSuppressionsTotal}</span> ·
          SendGridAudienceMap: <span className="tabular-nums font-semibold">{snap.counts.sendGridAudienceMaps}</span> ·
          SendGridContactMap: <span className="tabular-nums font-semibold">{snap.counts.sendGridContactMaps}</span>
        </p>
      </section>
    </div>
  );
}
