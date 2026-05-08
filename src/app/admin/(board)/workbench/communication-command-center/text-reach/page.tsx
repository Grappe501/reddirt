import Link from "next/link";
import { getTextReachFoundationReadiness } from "@/lib/communication-command-center/text-reach-readiness";
import { RelationalOrganizingPanel } from "@/components/admin/text-reach/RelationalOrganizingPanel";
import { TextMessagingSafetyPanel } from "@/components/admin/text-reach/TextMessagingSafetyPanel";
import { TextReachCommandCenter } from "@/components/admin/text-reach/TextReachCommandCenter";
import { VolunteerFollowUpPanel } from "@/components/admin/text-reach/VolunteerFollowUpPanel";

export const dynamic = "force-dynamic";

const WORKBENCH = "/admin/workbench";
const READINESS = "/admin/workbench/communication-command-center/readiness";
const REACH_PREVIEW = "/admin/workbench/people/relational-organizing";

export default async function TextReachFoundationPage() {
  const data = await getTextReachFoundationReadiness();

  return (
    <div className="min-w-0 max-w-4xl space-y-6 px-1 py-2">
      <div className="flex flex-wrap gap-2">
        <Link href={WORKBENCH} className="rounded border border-kelly-text/15 bg-white px-2 py-0.5 text-xs font-semibold text-kelly-slate">
          ← Workbench
        </Link>
        <Link href={READINESS} className="rounded border border-kelly-text/15 bg-white px-2 py-0.5 text-xs font-semibold text-kelly-slate">
          Communication readiness
        </Link>
        <Link
          href={REACH_PREVIEW}
          className="rounded border border-violet-300/50 bg-violet-50 px-2 py-0.5 text-xs font-bold text-violet-950"
        >
          RedDirt Reach preview
        </Link>
      </div>

      <header className="space-y-2">
        <h1 className="font-heading text-2xl font-bold text-kelly-navy">Text + Reach</h1>
        <p className="max-w-3xl font-body text-sm text-kelly-text/85">
          This is the campaign&apos;s home for <strong>text messaging</strong> and <strong>relational organizing</strong> inside RedDirt.
          Outbound texts, big contact uploads, and background robots stay off until headquarters turns each piece on.
        </p>
      </header>

      <div
        className={`rounded-lg border px-3 py-2 font-body text-sm ${
          data.ok ? "border-emerald-400/60 bg-emerald-50/90 text-emerald-950" : "border-amber-400/60 bg-amber-50/95 text-amber-950"
        }`}
        role="status"
      >
        {data.ok
          ? "Foundation looks good for the next build steps. Nothing here sends texts or imports lists."
          : "Some hosted checks are still red, or tables for people and volunteers are not all in place. Fix readiness first, then return here."}
      </div>

      <TextReachCommandCenter texting={data.texting} />
      <RelationalOrganizingPanel relational={data.relationalOrganizing} />
      <VolunteerFollowUpPanel followUp={data.followUpCockpit} />
      <TextMessagingSafetyPanel
        smsLocked={data.safety.twilioSmsApproved === false}
        bulkLocked={data.safety.bulkSmsApproved === false}
        importLocked={data.safety.contactImportApproved === false}
        workersLocked={data.safety.automationWorkersApproved === false}
        emailLocked={data.safety.liveEmailApproved === false}
        calendarWritesLocked={data.safety.calendarEventWriteApproved === false}
      />

      <section className="rounded-lg border border-kelly-text/10 bg-kelly-page/50 p-4">
        <h2 className="font-heading text-sm font-bold text-kelly-navy">Staff guides</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 font-body text-xs text-kelly-text/85">
          <li>docs/text-reach-foundation.md</li>
          <li>docs/native-text-command-center.md</li>
          <li>docs/relational-organizing-foundation.md</li>
        </ul>
        <p className="mt-3 font-body text-sm text-kelly-text/90">{data.nextRecommendedStep}</p>
      </section>
    </div>
  );
}
