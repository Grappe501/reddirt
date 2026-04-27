import Link from "next/link";
import { notFound } from "next/navigation";
import {
  approveBroadcastCampaignAction,
  cancelBroadcastCampaignAction,
  pauseBroadcastCampaignAction,
  processBroadcastBatchNowAction,
  queueBroadcastCampaignAction,
  submitBroadcastForApprovalAction,
  testBroadcastSendAction,
  updateBroadcastCampaignAction,
} from "@/app/admin/broadcast-comms-actions";
import { getBroadcastCampaign } from "@/lib/comms/broadcast-queries";
import { prisma } from "@/lib/db";
import {
  CampaignRecipientSendStatus,
  CommunicationCampaignStatus,
  CommunicationCampaignType,
} from "@prisma/client";

const h2 = "font-heading text-[10px] font-bold uppercase tracking-wider text-kelly-text/55";
const defAudience = (raw: object) => JSON.stringify(raw, null, 2);

type Props = { params: Promise<{ id: string }> };

export default async function BroadcastDetailPage({ params }: Props) {
  const { id } = await params;
  const c2 = await getBroadcastCampaign(id);
  if (!c2) notFound();
  const [recipients, pendingCount, failSamples, lastFail] = await Promise.all([
    prisma.communicationCampaignRecipient.findMany({
      where: { communicationCampaignId: c2.id },
      take: 80,
      orderBy: { id: "asc" },
    }),
    prisma.communicationCampaignRecipient.count({
      where: { communicationCampaignId: c2.id, sendStatus: CampaignRecipientSendStatus.PENDING },
    }),
    prisma.communicationCampaignRecipient.findMany({
      where: {
        communicationCampaignId: c2.id,
        sendStatus: { in: [CampaignRecipientSendStatus.FAILED, CampaignRecipientSendStatus.BOUNCED] },
      },
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
    prisma.communicationCampaignRecipient.findFirst({
      where: {
        communicationCampaignId: c2.id,
        sendStatus: { in: [CampaignRecipientSendStatus.FAILED, CampaignRecipientSendStatus.BOUNCED] },
      },
      orderBy: { failedAt: "desc" },
    }),
  ]);
  return (
    <div className="mx-auto max-w-4xl p-2">
      <p className="text-[10px] text-kelly-slate">
        <Link href="/admin/workbench/comms/broadcasts">← Campaigns</Link>
      </p>
      <h1 className="mt-1 font-heading text-lg font-bold text-kelly-text">{c2.name}</h1>
      <p className="font-mono text-[9px] text-kelly-text/50">{c2.id}</p>
      {c2.automationStatus !== "NONE" || c2.orchestrationIdempotencyKey ? (
        <p className="mt-0.5 rounded border border-amber-200/80 bg-amber-50/50 px-1 py-0.5 text-[9px] text-amber-950/80">
          <span className="font-bold">Orchestration:</span> {c2.automationStatus}
          {c2.triggerSourceType ? ` · ${c2.triggerSourceType}` : ""}
          {c2.triggerSourceId ? ` id ${c2.triggerSourceId}` : ""}
          {c2.generatedFromTemplateKey ? ` · ${c2.generatedFromTemplateKey}` : ""}
          {c2.orchestrationIdempotencyKey ? ` · ${c2.orchestrationIdempotencyKey}` : ""}
        </p>
      ) : null}
      {c2.event ? (
        <p className="text-[10px] text-kelly-text/70">
          Event: {c2.event.title} · {c2.event.eventWorkflowState} · {c2.event.startAt.toLocaleString()}
        </p>
      ) : null}
      <div className="mt-2 grid grid-cols-2 gap-0.5 border border-kelly-text/10 bg-kelly-page/50 p-1 md:grid-cols-4">
        <div>
          <p className={h2}>Status</p>
          <p className="text-sm font-bold text-kelly-text">{c2.status}</p>
        </div>
        <div>
          <p className={h2}>Recipients</p>
          <p className="text-sm font-bold">{c2.totalRecipients}</p>
        </div>
        <div>
          <p className={h2}>Suppressed</p>
          <p className="text-sm font-bold text-red-800">{c2.suppressedCount}</p>
        </div>
        <div>
          <p className={h2}>Sent / del / fail</p>
          <p className="text-sm font-mono">
            {c2.sentCount} / {c2.deliveredCount} / {c2.failedCount}
          </p>
        </div>
        <div>
          <p className={h2}>Open / click (email)</p>
          <p className="text-sm font-mono">
            {c2.engagementOpenCount} / {c2.engagementClickCount}
          </p>
        </div>
        <div>
          <p className={h2}>Replies (SMS)</p>
          <p className="text-sm font-bold text-kelly-slate">{c2.replyCount}</p>
        </div>
        <div>
          <p className={h2}>Opt-out / suppr.</p>
          <p className="text-sm font-bold">{c2.optOutCount}</p>
        </div>
        <div>
          <p className={h2}>Type</p>
          <p className="text-[10px]">{c2.campaignType}</p>
        </div>
        <div>
          <p className={h2}>Channel</p>
          <p className="text-[10px]">{c2.channel}</p>
        </div>
      </div>

      <div className="mt-2 space-y-0.5 border border-kelly-text/10 bg-amber-50/40 p-1.5 text-[9px] text-kelly-text/80">
        <p className="font-bold uppercase text-kelly-text/55">Send health</p>
        <p>
          <span className="text-kelly-text/55">Lock until:</span>{" "}
          {c2.processingLockUntil ? c2.processingLockUntil.toLocaleString() : "—"}{" "}
          <span className="text-kelly-text/55">· Last run:</span> {c2.lastProcessedAt ? c2.lastProcessedAt.toLocaleString() : "—"}
        </p>
        <p>
          <span className="text-kelly-text/55">Batch progress (pending in queue):</span> {pendingCount} of{" "}
          {c2.totalRecipients} rows ·{" "}
          {c2.status === CommunicationCampaignStatus.SENDING
            ? "worker active—cron or “Run batch now” will drain pending rows"
            : c2.status}
        </p>
        {c2.lastProcessError ? (
          <p className="text-red-800">
            <span className="font-semibold">Last error:</span> {c2.lastProcessError}
          </p>
        ) : null}
        {lastFail ? (
          <p>
            <span className="text-kelly-text/55">Last failure at:</span> {lastFail.failedAt?.toLocaleString() ?? "—"}{" "}
            {lastFail.lastError ? `· ${lastFail.lastError}` : ""}
          </p>
        ) : null}
      </div>

      <form action={updateBroadcastCampaignAction} className="mt-3 space-y-1.5 text-[10px]">
        <input type="hidden" name="id" value={c2.id} />
        <label className="block">
          <span className={h2}>Name</span>
          <input name="name" defaultValue={c2.name} className="mt-0.5 w-full border border-kelly-text/15 bg-white px-1" />
        </label>
        <div className="grid grid-cols-2 gap-1">
          <label>
            <span className={h2}>Type</span>
            <select name="campaignType" defaultValue={c2.campaignType} className="mt-0.5 w-full border border-kelly-text/15 bg-white">
              {Object.values(CommunicationCampaignType).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className={h2}>Event id</span>
            <input name="eventId" defaultValue={c2.eventId ?? ""} className="mt-0.5 w-full border border-kelly-text/15 bg-white font-mono" />
          </label>
        </div>
        <label>
          <span className={h2}>Subject</span>
          <input name="subjectText" defaultValue={c2.subjectText ?? ""} className="mt-0.5 w-full border border-kelly-text/15 bg-white" />
        </label>
        <label>
          <span className={h2}>Body</span>
          <textarea
            name="bodyText"
            defaultValue={c2.bodyText ?? c2.template?.bodyTemplate ?? ""}
            rows={5}
            className="mt-0.5 w-full border border-kelly-text/15 bg-white p-0.5 font-mono text-[9px]"
          />
        </label>
        <label>
          <span className={h2}>Audience JSON</span>
          <textarea
            name="audienceJson"
            defaultValue={defAudience((c2.audienceDefinitionJson as object) ?? {})}
            rows={6}
            className="mt-0.5 w-full border border-kelly-text/15 bg-white p-0.5 font-mono text-[9px]"
          />
        </label>
        <label>
          <span className={h2}>Template id</span>
          <input name="templateId" defaultValue={c2.templateId ?? ""} className="mt-0.5 w-full font-mono" />
        </label>
        <button type="submit" className="rounded border border-kelly-text/20 bg-white px-1.5 py-0.5 text-[9px] font-bold">
          Save
        </button>
      </form>

      <div className="mt-2 flex flex-wrap gap-0.5 border-t border-kelly-text/10 pt-2 text-[9px]">
        <form action={submitBroadcastForApprovalAction}>
          <input type="hidden" name="id" value={c2.id} />
          <button
            type="submit"
            className="rounded border border-kelly-text/20 bg-white px-1 py-0.5"
            disabled={c2.status !== CommunicationCampaignStatus.DRAFT}
          >
            Submit for approval
          </button>
        </form>
        <form action={approveBroadcastCampaignAction}>
          <input type="hidden" name="id" value={c2.id} />
          <button
            type="submit"
            className="rounded border border-kelly-muted/30 bg-kelly-muted/10 px-1 py-0.5"
            disabled={c2.status !== CommunicationCampaignStatus.APPROVAL_NEEDED}
          >
            Approve
          </button>
        </form>
        <form action={queueBroadcastCampaignAction} className="flex flex-wrap items-end gap-0.5">
          <input type="hidden" name="id" value={c2.id} />
          <label className="text-[8px] text-kelly-text/55">
            Schedule
            <input name="scheduledAt" type="datetime-local" className="ml-0.5 border border-kelly-text/15 bg-white text-[8px]" />
          </label>
          <button
            type="submit"
            className="rounded border border-kelly-navy/30 bg-kelly-navy px-1.5 py-0.5 font-bold text-kelly-page"
            disabled={c2.status !== CommunicationCampaignStatus.APPROVED}
          >
            Queue (seed + run)
          </button>
        </form>
        <form action={processBroadcastBatchNowAction}>
          <input type="hidden" name="id" value={c2.id} />
          <button type="submit" className="rounded border border-kelly-text/20 bg-white px-1 py-0.5">
            Run batch now
          </button>
        </form>
        <form action={pauseBroadcastCampaignAction}>
          <input type="hidden" name="id" value={c2.id} />
          <button type="submit" className="rounded border border-kelly-text/20 bg-kelly-page px-1 py-0.5">
            Pause
          </button>
        </form>
        <form action={cancelBroadcastCampaignAction}>
          <input type="hidden" name="id" value={c2.id} />
          <button type="submit" className="rounded border border-red-800/20 px-1 py-0.5 text-red-900">
            Cancel
          </button>
        </form>
      </div>

      <form action={testBroadcastSendAction} className="mt-2 border-t border-kelly-text/10 pt-2 text-[9px]">
        <p className={h2}>Test send</p>
        <div className="mt-0.5 flex flex-wrap gap-0.5">
          <input name="testPhone" placeholder="phone" className="border border-kelly-text/15 bg-white font-mono" />
          <input name="testEmail" placeholder="email" className="border border-kelly-text/15 bg-white font-mono" />
          <select name="mode" className="border border-kelly-text/15 bg-white">
            <option value="email">email</option>
            <option value="sms">sms</option>
          </select>
        </div>
        <textarea
          name="bodyText"
          defaultValue={c2.bodyText ?? c2.template?.bodyTemplate ?? "Test body"}
          rows={2}
          className="mt-0.5 w-full border border-kelly-text/15 bg-white p-0.5 font-mono text-[9px]"
        />
        <input name="subjectText" defaultValue={c2.subjectText ?? c2.template?.subjectTemplate ?? "Test"} className="mt-0.5 w-full border border-kelly-text/15 bg-white" />
        <button type="submit" className="mt-0.5 rounded border border-kelly-text/20 bg-white px-1 py-0.5">
          Test send
        </button>
      </form>

      <h2 className={`${h2} mt-3`}>Recent failures (last 20)</h2>
      <div className="mt-0.5 max-h-40 overflow-y-auto border border-red-800/20 bg-red-50/30 font-mono text-[8px]">
        {failSamples.length ? (
          failSamples.map((r) => (
            <div key={r.id} className="border-b border-kelly-text/5 px-0.5 py-0.5">
              {r.sendStatus} · {r.channel} · {r.recipientEmail ?? r.recipientPhone ?? "—"}{" "}
              {r.lastError ? `· ${r.lastError}` : ""}
            </div>
          ))
        ) : (
          <p className="p-1 text-kelly-text/50">No failed/bounced rows.</p>
        )}
      </div>

      <h2 className={`${h2} mt-3`}>Recipients (first 80)</h2>
      <div className="mt-0.5 max-h-64 overflow-y-auto border border-kelly-text/10 bg-kelly-page/30 font-mono text-[8px]">
        {recipients.map((r) => (
          <div key={r.id} className="border-b border-kelly-text/5 px-0.5 py-0.5">
            {r.sendStatus} · {r.channel} · {r.recipientEmail ?? r.recipientPhone ?? "—"}{" "}
            {r.engagementOpenedAt ? "· opened " : ""}
            {r.engagementClickedAt ? "· clicked " : ""}
            {r.lastError ? `· ${r.lastError}` : ""}
          </div>
        ))}
        {recipients.length === 0 ? <p className="p-1 text-kelly-text/50">No rows — queue the campaign to seed.</p> : null}
      </div>
    </div>
  );
}
