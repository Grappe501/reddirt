import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  ignoreCommunicationIdentityAction,
  markCommunicationIdentityNeedsReviewAction,
} from "@/app/admin/communication-ingest-actions";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ identityId: string }> };

export default async function CommunicationIdentityDetailPage({ params }: Props) {
  const { identityId } = await params;
  const identity = await prisma.communicationIdentity.findUnique({
    where: { id: identityId },
    include: {
      signals: { orderBy: { createdAt: "desc" }, take: 40 },
      matchCandidates: { orderBy: { createdAt: "desc" }, take: 20 },
      emailContactProfile: { select: { id: true, primaryEmail: true, displayName: true } },
    },
  });
  if (!identity) notFound();

  const gmailParts = await prisma.gmailMessageParticipant.findMany({
    where: { communicationIdentityId: identity.id },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { gmailMessageRecord: { select: { id: true, subject: true, sentAt: true, snippet: true } } },
  });

  const calParts = await prisma.googleCalendarEventParticipant.findMany({
    where: { communicationIdentityId: identity.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      googleCalendarEventRecord: { select: { id: true, summary: true, startAt: true, privacyRedacted: true } },
    },
  });

  return (
    <div className="min-w-0 max-w-4xl space-y-3 px-2 py-3 text-[11px]">
      <Link href="/admin/workbench/communication-intelligence" className="text-[10px] font-semibold text-kelly-forest underline">
        ← Communication Intelligence
      </Link>
      <header>
        <h1 className="font-heading text-lg font-bold text-kelly-navy">{identity.displayName ?? identity.normalizedEmail ?? identity.id}</h1>
        <p className="text-[10px] text-kelly-text/70">
          Review status: <strong>{identity.reviewStatus}</strong> · normalized email: {identity.normalizedEmail ?? "—"}
        </p>
      </header>
      {identity.emailContactProfile ? (
        <p>
          Linked profile:{" "}
          <Link href="/admin/workbench/email-command-center/profiles" className="font-bold text-kelly-forest underline">
            {identity.emailContactProfile.displayName ?? identity.emailContactProfile.primaryEmail}
          </Link>{" "}
          <span className="font-mono text-[9px] text-kelly-text/55">id {identity.emailContactProfile.id}</span>{" "}
          <span className="text-[9px] text-kelly-text/55">(open profiles list — no send)</span>
        </p>
      ) : (
        <p className="text-kelly-text/70">No EmailContactProfile linked yet.</p>
      )}
      <div className="flex flex-wrap gap-2">
        <form action={markCommunicationIdentityNeedsReviewAction}>
          <input type="hidden" name="identityId" value={identity.id} />
          <button type="submit" className="rounded border border-amber-300/60 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-950">
            Mark needs review
          </button>
        </form>
        <form action={ignoreCommunicationIdentityAction}>
          <input type="hidden" name="identityId" value={identity.id} />
          <button type="submit" className="rounded border border-kelly-text/20 bg-white px-2 py-0.5 text-[10px] font-bold">
            Ignore identity
          </button>
        </form>
      </div>
      <section className="rounded border border-kelly-text/10 bg-white/90 p-2">
        <p className="font-heading text-[10px] font-bold uppercase text-kelly-text/55">Signals (not audience-approved)</p>
        <ul className="mt-1 list-inside list-disc text-[10px]">
          {identity.signals.map((s) => (
            <li key={s.id}>
              {s.source} · {s.signalType}: {s.value.slice(0, 120)}
              {s.value.length > 120 ? "…" : ""} · audience-approved: {String(s.approvedForAudienceUse)}
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded border border-kelly-text/10 bg-white/90 p-2">
        <p className="font-heading text-[10px] font-bold uppercase text-kelly-text/55">Gmail touchpoints</p>
        <ul className="mt-1 space-y-1 text-[10px]">
          {gmailParts.map((p) => (
            <li key={p.id}>
              {p.gmailMessageRecord.subject ?? "(no subject)"} · {p.role} · {p.gmailMessageRecord.sentAt?.toISOString() ?? "—"}
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded border border-kelly-text/10 bg-white/90 p-2">
        <p className="font-heading text-[10px] font-bold uppercase text-kelly-text/55">Calendar touchpoints</p>
        <ul className="mt-1 space-y-1 text-[10px]">
          {calParts.map((p) => (
            <li key={p.id}>
              {p.googleCalendarEventRecord.summary ?? "(event)"} · {p.googleCalendarEventRecord.startAt?.toISOString() ?? "—"}{" "}
              {p.googleCalendarEventRecord.privacyRedacted ? "· redacted" : ""}
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded border border-kelly-text/10 bg-white/90 p-2">
        <p className="font-heading text-[10px] font-bold uppercase text-kelly-text/55">Match candidates</p>
        <ul className="mt-1 list-inside list-disc text-[10px]">
          {identity.matchCandidates.map((m) => (
            <li key={m.id}>
              {m.targetType} {m.targetId} · {m.status} · {m.confidence}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
