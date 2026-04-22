import Link from "next/link";
import { createBroadcastCampaignAction, saveCommunicationTemplateAction } from "@/app/admin/broadcast-comms-actions";
import { BroadcastAudiencePreview } from "@/components/admin/broadcasts/BroadcastAudiencePreview";
import {
  listCounties,
  listTags,
  listTemplates,
  listSegments,
  listUpcomingEventsForComms,
} from "@/lib/comms/broadcast-queries";
import { CommunicationCampaignType } from "@prisma/client";

const h2 = "font-heading text-[10px] font-bold uppercase tracking-wider text-deep-soil/55";
const defAudience = `{
  "countyIds": [],
  "tagKeys": [],
  "eventIdForSignups": "",
  "commitmentTypes": [],
  "requireEmail": false,
  "requirePhone": false,
  "emailEligible": true,
  "smsEligible": true,
  "applyPreferenceSuppression": true,
  "excludeUserIds": []
}`;

export default async function NewBroadcastPage() {
  const [templates, segments, events, tags, counties] = await Promise.all([
    listTemplates(),
    listSegments(),
    listUpcomingEventsForComms(),
    listTags(),
    listCounties(),
  ]);
  return (
    <div className="mx-auto max-w-3xl p-2">
      <p className="text-[10px] text-civic-slate">
        <Link href="/admin/workbench/comms/broadcasts">← Broadcasts</Link>
      </p>
      <h1 className="mt-1 font-heading text-lg font-bold text-deep-soil">New broadcast campaign</h1>
      <form id="new-broadcast" action={createBroadcastCampaignAction} className="mt-2 grid gap-1.5 text-[11px]">
        <label className="grid gap-0.5">
          <span className={h2}>Name</span>
          <input name="name" className="border border-deep-soil/15 bg-white px-1 py-0.5" placeholder="E.g. GOTV – Central OK" />
        </label>
        <div className="grid grid-cols-2 gap-1">
          <label className="grid gap-0.5">
            <span className={h2}>Channel</span>
            <select id="broadcast-channel" name="channel" className="border border-deep-soil/15 bg-white px-0.5 text-[10px]">
              <option value="MIXED">MIXED (prefer email per person)</option>
              <option value="EMAIL">EMAIL</option>
              <option value="SMS">SMS</option>
            </select>
          </label>
          <label className="grid gap-0.5">
            <span className={h2}>Campaign type</span>
            <select name="campaignType" className="border border-deep-soil/15 bg-white px-0.5 text-[10px]">
              {Object.values(CommunicationCampaignType).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="grid gap-0.5">
          <span className={h2}>Event (optional — gates sends by event stage)</span>
          <select name="eventId" className="border border-deep-soil/15 bg-white px-0.5 text-[10px]">
            <option value="">— None —</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title} · {e.eventWorkflowState} · {e.startAt.toLocaleDateString()}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-0.5">
          <span className={h2}>Template (optional)</span>
          <select name="templateId" className="border border-deep-soil/15 bg-white px-0.5 text-[10px]">
            <option value="">— Ad-hoc body only —</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.channel})
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-0.5">
          <span className={h2}>Saved audience segment (optional; JSON below still applies if both)</span>
          <select name="audienceSegmentId" className="border border-deep-soil/15 bg-white px-0.5 text-[10px]">
            <option value="">— None —</option>
            {segments.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} (est. {s.estimatedCount ?? "—"})
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-0.5">
          <span className={h2}>Subject (email)</span>
          <input name="subjectText" className="border border-deep-soil/15 bg-white px-1 py-0.5" />
        </label>
        <label className="grid gap-0.5">
          <span className={h2}>Body (use {"{{firstName}}"}; falls back to email local part)</span>
          <textarea
            name="bodyText"
            rows={5}
            className="w-full border border-deep-soil/15 bg-white p-0.5 font-mono text-[10px]"
            placeholder="Hi {{firstName}} — quick note from the campaign…"
          />
        </label>
        <div>
          <span className={h2}>Audience JSON</span>
          <textarea
            id="broadcast-audience-json"
            name="audienceJson"
            defaultValue={defAudience}
            rows={8}
            className="mt-0.5 w-full border border-deep-soil/15 bg-white p-0.5 font-mono text-[9px]"
          />
          <p className="mt-0.5 text-[9px] text-deep-soil/50">
            Counties: {counties.length} in DB. Tags: {tags.map((t) => t.key).join(", ") || "none seeded"}.
            Set <code className="font-mono">eventIdForSignups</code> to an event id for attendee-only sends.
          </p>
          <BroadcastAudiencePreview defaultJson={defAudience} defaultChannel="MIXED" />
        </div>
        <button type="submit" className="w-fit rounded border border-red-dirt/30 bg-red-dirt px-2 py-0.5 text-xs font-bold text-cream-canvas">
          Save draft
        </button>
      </form>
      <div className="mt-4 border-t border-deep-soil/10 pt-2">
        <h2 className={h2}>Quick: save a reusable template</h2>
        <form action={saveCommunicationTemplateAction} className="mt-1 flex flex-col gap-0.5 text-[10px]">
          <input name="name" placeholder="Template name" className="border border-deep-soil/15 bg-white px-1" />
          <div className="flex gap-1">
            <select name="channel" className="border border-deep-soil/15 bg-white text-[9px]">
              <option value="EMAIL">EMAIL</option>
              <option value="SMS">SMS</option>
            </select>
            <input name="subjectTemplate" placeholder="Subject" className="flex-1 border border-deep-soil/15 bg-white px-1" />
          </div>
          <textarea name="bodyTemplate" rows={3} className="border border-deep-soil/15 bg-white p-0.5 font-mono text-[9px]" />
          <button type="submit" className="w-fit rounded border border-deep-soil/20 bg-white px-1 py-0.5 text-[9px] font-bold">
            Save template
          </button>
        </form>
      </div>
    </div>
  );
}

