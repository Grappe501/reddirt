import Link from "next/link";
import { EmailWorkflowSourceType } from "@prisma/client";
import { EccOperatorPageChrome } from "@/components/admin/email-command-center/ecc-operator-ux";
import {
  getAudienceStudioSnapshot,
  isVolunteerRelatedAudienceCriteria,
  isVolunteerRelatedAudienceName,
  listAudienceBuildingBlocks,
  listEmailAudienceDefinitions,
  listSuggestedAudienceClusters,
} from "@/lib/email-command-center/audience-studio";
import { listSendGridAudienceReadiness } from "@/lib/email-command-center/sendgrid-foundation";
import { listLatestContactSyncRunStatusByAudienceIds } from "@/lib/email-command-center/sendgrid-contact-sync";
import { AudienceAiStrategistPanel } from "@/components/admin/email-command-center/AudienceAiStrategistPanel";
import { AudienceStudioPreviewForm } from "@/components/admin/email-command-center/AudienceStudioPreviewForm";
import {
  activateEmailAudienceDefinitionAction,
  archiveEmailAudienceDefinitionAction,
  createDraftEmailAudienceDefinitionAction,
  previewSavedEmailAudienceDefinitionAction,
} from "@/app/admin/email-audience-actions";
import { getEmailCommandCenterSnapshot } from "@/lib/email-command-center/read-model";

export const dynamic = "force-dynamic";

export default async function EmailAudienceStudioPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const notice = typeof sp.notice === "string" ? sp.notice : undefined;
  const error = typeof sp.error === "string" ? sp.error : undefined;
  const previewDef = typeof sp.def === "string" ? sp.def : undefined;
  const previewMc = typeof sp.mc === "string" ? sp.mc : undefined;
  const activateWhy = typeof sp.why === "string" ? decodeURIComponent(sp.why) : undefined;
  const workflowSourcePrefill =
    typeof sp.workflowSourceType === "string" && sp.workflowSourceType.trim()
      ? sp.workflowSourceType.trim()
      : "";
  const volunteerCriteriaHint = JSON.stringify({ workflowSourceType: "VOLUNTEER_TRIGGER" }, null, 0);

  const [snapshot, eccSnapshot] = await Promise.all([getAudienceStudioSnapshot(), getEmailCommandCenterSnapshot()]);

  let blocks: Awaited<ReturnType<typeof listAudienceBuildingBlocks>> = [];
  let clusters: Awaited<ReturnType<typeof listSuggestedAudienceClusters>> = [];
  let definitions: Awaited<ReturnType<typeof listEmailAudienceDefinitions>> = [];
  let sendGridReadinessById: Record<string, string> = {};
  let contactSyncRunByAudience: Record<string, { status: string; runId: string }> = {};
  let listsOk = snapshot.dbAvailable;

  if (snapshot.dbAvailable) {
    try {
      const [b, c, d, sgR] = await Promise.all([
        listAudienceBuildingBlocks(),
        listSuggestedAudienceClusters(),
        listEmailAudienceDefinitions({ includeArchived: true }),
        listSendGridAudienceReadiness(),
      ]);
      blocks = b;
      clusters = c;
      definitions = d;
      sendGridReadinessById = Object.fromEntries(sgR.map((r) => [r.audienceDefinitionId, r.sendGridReadinessLabel]));
      if (d.length) {
        contactSyncRunByAudience = await listLatestContactSyncRunStatusByAudienceIds(d.map((x) => x.id));
      }
    } catch {
      listsOk = false;
    }
  }

  const sourceTypes = Object.values(EmailWorkflowSourceType);

  return (
    <div className="min-w-0 max-w-5xl space-y-4">
      <EccOperatorPageChrome snapshot={eccSnapshot} surface="audiences" />

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/admin/workbench/email-command-center"
          className="rounded border border-kelly-text/15 bg-white px-2 py-0.5 text-xs font-semibold text-kelly-slate"
        >
          ← Communication Command Center
        </Link>
        <Link href="/admin/workbench/email-command-center/profiles" className="text-xs text-kelly-text/60 hover:underline">
          Profile &amp; hint review
        </Link>
        <Link href="/admin/workbench/email-queue" className="text-xs text-kelly-text/60 hover:underline">
          Email queue
        </Link>
        <Link
          href="/admin/workbench/email-command-center/message-studio"
          className="text-xs font-semibold text-kelly-forest hover:underline"
        >
          Message Studio
        </Link>
        <Link href="/admin/workbench/email-command-center/analytics" className="text-xs text-kelly-text/60 hover:underline">
          Analytics &amp; Deliverability
        </Link>
        <Link href="/admin/workbench/email-command-center/map" className="text-xs text-kelly-text/60 hover:underline">
          Route map
        </Link>
        <Link href="/admin/workbench/email-command-center/readiness" className="text-xs text-kelly-text/60 hover:underline">
          Readiness
        </Link>
        <Link
          href="/admin/workbench/email-command-center/launch-room"
          className="text-xs font-bold text-kelly-navy hover:underline"
        >
          Email Launch Room
        </Link>
        <Link
          href="/admin/workbench/email-command-center/send-execution"
          className="text-xs text-kelly-text/60 hover:underline"
        >
          Send execution governance
        </Link>
      </div>

      <header>
        <h1 className="font-heading text-xl font-bold text-kelly-navy">Audience / Microtargeting Studio</h1>
        <p className="mt-1 max-w-3xl font-body text-sm text-kelly-text/85">
          EMAIL-AUDIENCE-STUDIO-1.0 + <strong>EMAIL-AI-AUDIENCE-STRATEGIST-1.0</strong> — preview and govern campaign email audiences from the{" "}
          <strong>approved profile graph</strong> before SendGrid or mass send exist. The strategist recommends criteria and copy
          frames only (deterministic); this surface is planning-only.
        </p>
        <p className="mt-2">
          <Link
            href="/admin/workbench/email-command-center/message-studio"
            className="inline-flex rounded border border-kelly-navy/30 bg-kelly-fog/70 px-2 py-1 text-xs font-bold text-kelly-navy hover:border-kelly-forest/40"
          >
            Prepare message for an audience
          </Link>
          <span className="ml-2 font-body text-[10px] text-kelly-text/65">
            Opens Message Studio — add <span className="font-mono">?audienceDefinitionId=…</span> from a saved definition
            row below when you want the chip prefilled.
          </span>
        </p>
      </header>

      <section className="rounded-lg border border-rose-300/50 bg-rose-50/80 px-3 py-2">
        <h2 className="font-heading text-[10px] font-bold uppercase tracking-wide text-rose-950">Governance</h2>
        <ul className="mt-1 list-inside list-disc font-body text-[11px] text-rose-950/95">
          <li>No email sends from this page — queue send flag stays false.</li>
          <li>
            SendGrid Contact Sync (1.1) can record preview-only audit rows from SendGrid Foundation — still no Marketing API calls,
            no list sync execution, no broadcast.
          </li>
          <li>
            <strong>ACTIVE</strong> <code className="text-[10px]">EmailContactProfileFact</code> rows are the safest
            targeting substrate; pending AI suggestions are shown separately and are not broadcast-eligible.
          </li>
          <li>Audience hints are planning signals — not segments — until future governed packets say otherwise.</li>
          <li>
            <strong>AI Audience Strategist</strong> suggests criteria only — operators must preview counts and use{" "}
            <strong>Create draft audience (explicit submit)</strong>; nothing auto-saves without that action.
          </li>
        </ul>
      </section>

      {!snapshot.dbAvailable || !listsOk ? (
        <div className="rounded-lg border border-amber-300/60 bg-amber-50/90 px-3 py-2 font-body text-[11px] text-amber-950">
          Database slice unreachable or audience tables not migrated — run{" "}
          <code className="text-[10px]">npx prisma migrate deploy</code> when <code className="text-[10px]">DATABASE_URL</code>{" "}
          is healthy. Preflight: <code className="text-[10px]">node scripts/email-command-center-preflight.mjs</code>.
        </div>
      ) : null}

      {notice === "draft-saved" ? (
        <p className="rounded border border-emerald-300/60 bg-emerald-50 px-2 py-1 text-[11px] text-emerald-950" role="status">
          Draft audience definition saved.
        </p>
      ) : null}
      {notice === "archived" ? (
        <p className="rounded border border-emerald-300/60 bg-emerald-50 px-2 py-1 text-[11px] text-emerald-950" role="status">
          Audience definition archived.
        </p>
      ) : null}
      {notice === "preview-done" && previewDef && previewMc != null ? (
        <p className="rounded border border-emerald-300/60 bg-emerald-50 px-2 py-1 text-[11px] text-emerald-950" role="status">
          Preview logged for definition <span className="font-mono">{previewDef.slice(0, 12)}…</span> — match count{" "}
          <strong>{previewMc}</strong>. Send Execution preflight remains authoritative for consent/import gates.
        </p>
      ) : null}
      {notice === "activated" && previewDef ? (
        <p className="rounded border border-emerald-300/60 bg-emerald-50 px-2 py-1 text-[11px] text-emerald-950" role="status">
          Audience <span className="font-mono">{previewDef.slice(0, 12)}…</span> is now <strong>ACTIVE</strong> (not sent).
          Matched ≈{previewMc ?? "—"} profiles. Local suppression hint on sampled emails: excluded ≈{typeof sp.sup === "string" ? sp.sup : "—"}, eligible ≈{typeof sp.elig === "string" ? sp.elig : "—"} — continue to SendGrid sync and Send Execution.
        </p>
      ) : null}
      {error === "activate-blocked" && activateWhy ? (
        <p className="rounded border border-rose-300/60 bg-rose-50 px-2 py-1 text-[11px] text-rose-950" role="alert">
          <strong>Activation blocked:</strong> {activateWhy}
        </p>
      ) : null}
      {error && error !== "activate-blocked" ? (
        <p className="rounded border border-rose-300/60 bg-rose-50 px-2 py-1 text-[11px] text-rose-950" role="alert">
          {error === "preview-not-found"
            ? "Audience definition not found for preview."
            : error === "preview-id"
              ? "Missing audience id for preview."
              : error === "activate-id"
                ? "Missing audience id for activation."
                : error}
        </p>
      ) : null}

      <section className="rounded-lg border border-kelly-navy/20 bg-kelly-fog/50 p-3">
        <h2 className="font-heading text-xs font-bold text-kelly-navy">What ACTIVE means</h2>
        <ul className="mt-1 list-inside list-disc font-body text-[10px] text-kelly-text/85">
          <li>
            <strong>ACTIVE</strong> only means this definition&apos;s criteria passed validation and the preview shows at least one profile with a usable primary email. It does <strong>not</strong> mean any message was sent.
          </li>
          <li>ACTIVE audiences may be selected for SendGrid contact sync and Send Execution assembly.</li>
          <li>
            A real broadcast still needs: Message Studio draft <strong>APPROVED_FOR_SEND_GOVERNANCE</strong>, send packet / checklists, Send Execution preflight, test send, final approval, typed confirmation, and <strong>SEND APPROVED</strong>.
          </li>
          <li>SendGrid ASM / unsubscribe group requirements and suppressions are enforced on the Send Execution path — not bypassed here.</li>
          <li>Import consent and hosted DB proof gates in Send Execution preflight stay authoritative; activation does not replace them.</li>
        </ul>
      </section>

      <section className="rounded-lg border border-kelly-forest/25 bg-emerald-50/40 p-3">
        <h2 className="font-heading text-xs font-bold text-kelly-navy">Volunteer distribution (governed broadcast only)</h2>
        <p className="mt-1 font-body text-[10px] text-kelly-text/85">
          Volunteer outreach uses the same SendGrid <strong>broadcast</strong> path as other campaigns — queue-item send stays off (
          <code className="text-[9px]">EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM</code> remains false). Below is a readiness strip for audiences tied to{" "}
          <code className="text-[9px]">VOLUNTEER_TRIGGER</code> or &quot;volunteer&quot; in the name.
        </p>
        {(() => {
          const vol = definitions.filter(
            (d) => isVolunteerRelatedAudienceCriteria(d.criteriaJson) || isVolunteerRelatedAudienceName(d.name),
          );
          const volActive = vol.filter((d) => d.status === "ACTIVE").length;
          const volDraft = vol.filter((d) => d.status === "DRAFT").length;
          return (
            <div className="mt-2 space-y-2 text-[10px] text-kelly-text/90">
              <p>
                <strong>ACTIVE</strong> volunteer-related audiences: {volActive} · <strong>DRAFT</strong>: {volDraft}
              </p>
              {vol.length === 0 ? (
                <p>
                  No volunteer-scoped audience yet. In Audience Studio, save a draft with criteria{" "}
                  <code className="rounded bg-white/80 px-1 text-[9px]">{volunteerCriteriaHint}</code> or use{" "}
                  <Link
                    href="/admin/workbench/email-command-center/audiences?workflowSourceType=VOLUNTEER_TRIGGER#audience-manual-draft"
                    className="font-bold text-kelly-forest underline"
                  >
                    deep link with workflowSourceType prefilled in the hint
                  </Link>
                  , then preview and activate.
                </p>
              ) : (
                <ul className="space-y-1">
                  {vol.slice(0, 12).map((d) => (
                    <li key={d.id} className="rounded border border-kelly-text/10 bg-white/70 px-2 py-1">
                      <span className="font-semibold">{d.name}</span>{" "}
                      <span className="rounded bg-kelly-fog px-1 text-[9px] font-bold uppercase">{d.status}</span>
                      {d.status === "ACTIVE" ? (
                        <>
                          {" "}
                          <Link
                            href={`/admin/workbench/email-command-center/sendgrid?preview=${encodeURIComponent(d.id)}#contact-sync`}
                            className="text-kelly-forest underline"
                          >
                            Sync contacts
                          </Link>
                          {contactSyncRunByAudience[d.id]?.status === "SYNCED" ? (
                            <>
                              {" · "}
                              <Link
                                href={`/admin/workbench/email-command-center/send-execution?audienceDefinitionId=${encodeURIComponent(d.id)}&sendGridContactSyncRunId=${encodeURIComponent(contactSyncRunByAudience[d.id]!.runId)}#ops`}
                                className="text-kelly-navy underline"
                              >
                                Send Execution
                              </Link>
                            </>
                          ) : (
                            <span className="text-kelly-text/60"> · sync not SYNCED yet</span>
                          )}
                        </>
                      ) : d.status === "DRAFT" ? (
                        <>
                          {" "}
                          <span className="text-kelly-text/65">Preview and activate from Saved definitions below.</span>
                        </>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
              <p>
                <Link href="/admin/workbench/email-command-center/launch-room" className="font-bold text-kelly-forest underline">
                  Email Launch Room
                </Link>{" "}
                for the full governed checklist.
              </p>
            </div>
          );
        })()}
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-lg border border-kelly-text/10 bg-white/90 p-3">
          <h2 className="font-heading text-sm font-bold text-kelly-navy">SendGrid readiness</h2>
          <p className="mt-1 text-[11px] text-kelly-text/80">
            EMAIL-SENDGRID-FOUNDATION-1.0 — foundation rails (readiness + webhook intake + local suppression tables).{" "}
            <strong>No live list sync</strong> and <strong>no sends</strong> from this studio. Per-audience posture is in
            the saved definitions list (SendGrid + Contact sync columns). Audience preview is{" "}
            <strong>not</strong> a send list until ACTIVE status, suppression checks, and operator sync preview say so.
          </p>
          <p className="mt-2 text-[11px]">
            <Link
              href="/admin/workbench/email-command-center/sendgrid"
              className="font-bold text-kelly-forest underline"
            >
              Open SendGrid Foundation
            </Link>
          </p>
        </div>
        <div className="rounded-lg border border-kelly-text/10 bg-kelly-page/50 p-3">
          <h2 className="font-heading text-sm font-bold text-kelly-navy">Counts (read model)</h2>
          <ul className="mt-1 space-y-0.5 font-body text-[11px] text-kelly-text/85">
            <li>Approved active facts (targeting substrate): {snapshot.approvedActiveFacts}</li>
            <li>Pending profile suggestions (not eligible alone): {snapshot.pendingProfileSuggestions}</li>
            <li>Pending audience hints (not broadcast-eligible): {snapshot.pendingAudienceHints}</li>
            <li>Distinct approved fact triples (building blocks): {snapshot.buildingBlockRowCount}</li>
            <li>Draft audience definitions: {snapshot.draftAudienceDefinitions}</li>
            <li>Active audience definitions: {snapshot.activeAudienceDefinitions}</li>
          </ul>
        </div>
      </section>

      <section className="rounded-lg border border-kelly-text/10 bg-white/90 p-3">
        <h2 className="font-heading text-sm font-bold text-kelly-navy">Audience building blocks</h2>
        <p className="mt-1 text-[10px] text-kelly-text/70">
          Grouped signals from approved facts, pending suggestions (separate), and hint labels. Use approved facts for
          safest previews.
        </p>
        <div className="mt-2 max-h-72 overflow-auto rounded border border-kelly-text/10">
          <table className="w-full text-left text-[10px]">
            <thead className="sticky top-0 bg-kelly-fog/80 text-kelly-text/70">
              <tr>
                <th className="px-2 py-1">Kind</th>
                <th className="px-2 py-1">Key / label</th>
                <th className="px-2 py-1">Value</th>
                <th className="px-2 py-1">Count</th>
                <th className="px-2 py-1">Avg conf.</th>
              </tr>
            </thead>
            <tbody>
              {blocks.slice(0, 80).map((b, i) => (
                <tr key={`${b.kind}-${i}`} className="border-t border-kelly-text/10">
                  <td className="px-2 py-1 font-semibold">{b.kind}</td>
                  <td className="px-2 py-1">{b.label ?? b.factKey ?? b.factType ?? "—"}</td>
                  <td className="px-2 py-1">{(b.factValue ?? b.hintStatus ?? "—").toString().slice(0, 80)}</td>
                  <td className="px-2 py-1 tabular-nums">{b.profileOrSuggestionCount}</td>
                  <td className="px-2 py-1 tabular-nums">{b.avgConfidence != null ? b.avgConfidence.toFixed(2) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!blocks.length && listsOk ? (
            <div className="p-2 text-[10px] text-kelly-navy" role="status">
              <p className="font-semibold">No building blocks yet</p>
              <p className="mt-1 text-kelly-text/80">
                Building blocks summarize approved graph signals — approve suggestions on{" "}
                <Link href="/admin/workbench/email-command-center/profiles" className="font-bold text-kelly-forest underline">
                  Profile review
                </Link>{" "}
                first.
              </p>
              <p className="mt-1 text-kelly-forest/90">
                <strong>Safety:</strong> previews still cap-limited; no SendGrid.
              </p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-lg border border-kelly-text/10 bg-white/90 p-3">
        <h2 className="font-heading text-sm font-bold text-kelly-navy">Suggested clusters</h2>
        <p className="mt-1 text-[10px] text-kelly-text/70">
          Approved hint labels and recurring fact key/value pairs (count ≥ 2 fact rows). Heuristic only.
        </p>
        <ul className="mt-2 space-y-1 text-[11px] text-kelly-text/85">
          {clusters.map((c) => (
            <li key={`${c.kind}-${c.label ?? c.factKey}-${c.factValue}`}>
              <span className="font-semibold">{c.kind}</span> —{" "}
              {c.label ?? `${c.factKey} = ${c.factValue?.slice(0, 60)}`} ·{" "}
              <span className="tabular-nums">{c.matchProfiles}</span> matches
            </li>
          ))}
        </ul>
        {!clusters.length && listsOk ? (
          <div className="mt-2 rounded border border-kelly-text/10 bg-kelly-fog/40 px-2 py-2 text-[10px] text-kelly-navy" role="status">
            <p className="font-semibold">No clusters yet</p>
            <p className="mt-1 text-kelly-text/80">
              Clusters are heuristics over recurring approved facts / hints — they appear after the graph has enough signal.
            </p>
            <p className="mt-1">
              <Link href="/admin/workbench/email-command-center/profiles" className="font-bold text-kelly-forest underline">
                Approve profile facts
              </Link>{" "}
              first, then refresh this page.
            </p>
          </div>
        ) : null}
      </section>

      {listsOk ? <AudienceAiStrategistPanel buildingBlocks={blocks} clusters={clusters} /> : null}

      <AudienceStudioPreviewForm />

      <section id="audience-manual-draft" className="rounded-lg border border-kelly-text/10 bg-white/90 p-3">
        <h2 className="font-heading text-sm font-bold text-kelly-navy">Save draft audience definition</h2>
        <p className="mb-2 text-[10px] text-kelly-text/70">
          Persists <code className="text-[9px]">criteriaJson</code> for operators — still no SendGrid sync.
        </p>
        <form action={createDraftEmailAudienceDefinitionAction} className="grid gap-2 sm:grid-cols-2">
          <label className="text-[10px] text-kelly-text/80 sm:col-span-2">
            Name
            <input name="name" required className="mt-0.5 w-full rounded border px-2 py-1 text-[11px]" />
          </label>
          <label className="text-[10px] text-kelly-text/80 sm:col-span-2">
            Description (optional)
            <input name="description" className="mt-0.5 w-full rounded border px-2 py-1 text-[11px]" />
          </label>
          <label className="text-[10px] text-kelly-text/80 sm:col-span-2">
            criteriaJson (optional JSON object — same shape as preview filters)
            <textarea
              name="criteriaJson"
              rows={3}
              defaultValue={
                workflowSourcePrefill
                  ? JSON.stringify({ workflowSourceType: workflowSourcePrefill }, null, 2)
                  : undefined
              }
              placeholder='{"factKeyEquals":"issue","county":"Pulaski"}'
              className="mt-0.5 w-full rounded border px-2 py-1 font-mono text-[10px]"
            />
          </label>
          <button
            type="submit"
            className="sm:col-span-2 rounded border border-kelly-navy/30 bg-kelly-navy/10 px-3 py-1 text-[11px] font-bold text-kelly-navy"
          >
            Create draft
          </button>
        </form>
      </section>

      <section className="rounded-lg border border-kelly-text/10 bg-kelly-page/40 p-3">
        <h2 className="font-heading text-sm font-bold text-kelly-navy">Saved definitions</h2>
        {definitions.length ? (
          <ul className="mt-2 space-y-2">
            {definitions.map((d) => (
              <li key={d.id} className="rounded border border-kelly-text/10 bg-white/80 px-2 py-2 text-[11px]">
                <p className="font-semibold text-kelly-navy">
                  {d.name}{" "}
                  <span
                    className={`rounded px-1 text-[9px] font-bold uppercase ${
                      d.status === "ACTIVE"
                        ? "border border-emerald-400/50 bg-emerald-100 text-emerald-950"
                        : d.status === "DRAFT"
                          ? "border border-amber-300/60 bg-amber-50 text-amber-950"
                          : "border border-kelly-text/20 bg-kelly-fog text-kelly-slate"
                    }`}
                  >
                    {d.status}
                  </span>
                  {listsOk ? (
                    <span className="ml-1 rounded border border-kelly-forest/25 bg-emerald-50/80 px-1 text-[9px] font-bold uppercase text-kelly-navy">
                      SendGrid: {sendGridReadinessById[d.id] ?? "—"}
                    </span>
                  ) : null}
                  {listsOk ? (
                    <span className="ml-1 rounded border border-kelly-navy/20 bg-kelly-fog/80 px-1 text-[9px] font-bold uppercase text-kelly-navy">
                      Sync run: {contactSyncRunByAudience[d.id]?.status ?? "—"}
                    </span>
                  ) : null}
                </p>
                <p className="text-[10px] text-kelly-text/60">Updated {d.updatedAt.toISOString()}</p>
                {d.status === "DRAFT" ? (
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <form action={previewSavedEmailAudienceDefinitionAction} className="inline">
                      <input type="hidden" name="id" value={d.id} />
                      <button
                        type="submit"
                        className="rounded border border-kelly-navy/30 bg-white px-2 py-0.5 text-[10px] font-bold text-kelly-navy"
                      >
                        Run preview
                      </button>
                    </form>
                    <form action={activateEmailAudienceDefinitionAction} className="inline">
                      <input type="hidden" name="id" value={d.id} />
                      <button
                        type="submit"
                        className="rounded border border-emerald-500/50 bg-emerald-50/90 px-2 py-0.5 text-[10px] font-bold text-emerald-950"
                      >
                        Activate audience
                      </button>
                    </form>
                    <form action={archiveEmailAudienceDefinitionAction} className="inline">
                      <input type="hidden" name="id" value={d.id} />
                      <button
                        type="submit"
                        className="rounded border border-rose-300/60 bg-rose-50/80 px-2 py-0.5 text-[10px] font-bold text-rose-900"
                      >
                        Archive
                      </button>
                    </form>
                  </div>
                ) : null}
                {d.status === "ACTIVE" ? (
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="rounded border border-emerald-200 bg-emerald-50/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-950">
                      Ready for SendGrid sync
                    </span>
                    <Link
                      href={`/admin/workbench/email-command-center/sendgrid?preview=${encodeURIComponent(d.id)}#contact-sync`}
                      className="rounded border border-kelly-navy/25 bg-white px-2 py-0.5 text-[10px] font-bold text-kelly-navy hover:underline"
                    >
                      Prepare contact sync
                    </Link>
                    <Link
                      href={`/admin/workbench/email-command-center/message-studio?audienceDefinitionId=${encodeURIComponent(d.id)}`}
                      className="rounded border border-kelly-forest/35 bg-emerald-50/70 px-2 py-0.5 text-[10px] font-bold text-kelly-navy hover:underline"
                    >
                      Prepare message for this audience
                    </Link>
                    {contactSyncRunByAudience[d.id]?.status === "SYNCED" ? (
                      <Link
                        href={`/admin/workbench/email-command-center/send-execution?audienceDefinitionId=${encodeURIComponent(d.id)}&sendGridContactSyncRunId=${encodeURIComponent(contactSyncRunByAudience[d.id]!.runId)}#ops`}
                        className="rounded border border-violet-300/60 bg-violet-50/90 px-2 py-0.5 text-[10px] font-bold text-violet-950 hover:underline"
                      >
                        Prepare send execution
                      </Link>
                    ) : (
                      <span className="text-[10px] text-kelly-text/60">
                        Send Execution link appears after a <strong>SYNCED</strong> contact sync run.
                      </span>
                    )}
                    <form action={archiveEmailAudienceDefinitionAction} className="inline">
                      <input type="hidden" name="id" value={d.id} />
                      <button
                        type="submit"
                        className="rounded border border-rose-300/60 bg-rose-50/80 px-2 py-0.5 text-[10px] font-bold text-rose-900"
                      >
                        Archive
                      </button>
                    </form>
                  </div>
                ) : null}
                {d.status === "ARCHIVED" ? (
                  <p className="mt-1 text-[10px] text-kelly-text/55">Archived — restore by creating a new draft if criteria change.</p>
                ) : null}
                {d.status !== "ARCHIVED" ? (
                  <p className="mt-1 text-[9px] text-kelly-text/60">
                    Use approved audience criteria in Message Studio — turn on <strong>Audience definition context</strong>{" "}
                    in Campaign Voice to guide tone and frames.
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-1 rounded border border-kelly-text/10 bg-kelly-fog/40 px-2 py-2 text-[11px] text-kelly-navy" role="status">
            <p className="font-semibold">No saved definitions yet</p>
            <p className="mt-1 text-[10px] text-kelly-text/80">
              Use the form below to save a draft definition (criteria JSON optional). Definitions stay local — no SendGrid sync
              in this lane.
            </p>
            <p className="mt-1 text-[10px]">
              <Link href="/admin/workbench/email-command-center/readiness" className="font-bold text-kelly-forest underline">
                Readiness checklist
              </Link>{" "}
              for migration/DB posture before relying on previews in prod.
            </p>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-kelly-text/10 bg-white/90 p-3">
        <h2 className="font-heading text-sm font-bold text-kelly-navy">Workflow source type reference</h2>
        <p className="text-[10px] text-kelly-text/70">Valid values for preview filter `workflowSourceType`:</p>
        <p className="mt-1 font-mono text-[10px] text-kelly-text/80">{sourceTypes.join(", ")}</p>
      </section>
    </div>
  );
}
