"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import {
  DOWNSTREAM_LEAD_EMAIL_SUBJECT,
  NEW_PERSON_EMAIL_SUBJECT,
  buildDownstreamTeamLeadEmail,
  buildNewPersonPlacementEmail,
  firstNameFromDisplay,
} from "@/lib/volunteer-ops/p5-placement-emails";
import type {
  P5PlacementFitCheckStatus,
  P5PlacementInviteLinkStatus,
  P5PlacementWorkflowStatus,
  Team,
  TeamPowerOfFivePlacementLead,
  TeamPowerOfFivePlacementNextStep,
} from "@/types/dashboard";

const NEXT_STEP_LABEL: Record<TeamPowerOfFivePlacementNextStep, string> = {
  "add-to-p5-network": "A · Add to P5 network",
  "place-downstream": "B · Place downstream",
  "invite-to-volunteer": "C · Invite to /volunteer",
  "invite-outreach-social-hour": "D · Outreach social hour",
  "invite-vr-event": "E · Voter registration event",
  "consider-downstream-team": "B · Consider downstream (legacy)",
};

const FIT_LABEL: Record<P5PlacementFitCheckStatus, string> = {
  pending: "Pending",
  sent: "Fit check sent",
  approved: "Approved",
  declined: "Declined",
  "not-applicable": "—",
};

const INVITE_LABEL: Record<P5PlacementInviteLinkStatus, string> = {
  none: "—",
  "pending-lead": "Awaiting lead link",
  "ready-to-send": "Ready to send",
  sent: "Invite sent",
};

const WORKFLOW_LABEL: Record<P5PlacementWorkflowStatus, string> = {
  "pending-fit-check": "Pending fit check",
  "invite-sent": "Invite sent",
  placed: "Placed",
  deferred: "Deferred",
};

function normalizeLead(lead: TeamPowerOfFivePlacementLead): TeamPowerOfFivePlacementLead {
  const downstreamish =
    lead.suggestedNextStep === "place-downstream" || lead.suggestedNextStep === "consider-downstream-team";
  const fitCheckStatus: P5PlacementFitCheckStatus =
    lead.fitCheckStatus ?? (downstreamish ? "pending" : "not-applicable");
  const inviteLinkStatus: P5PlacementInviteLinkStatus = lead.inviteLinkStatus ?? (downstreamish ? "pending-lead" : "none");
  let workflowStatus: P5PlacementWorkflowStatus = lead.workflowStatus ?? "pending-fit-check";
  if (lead.status === "placed") workflowStatus = "placed";
  if (lead.status === "deferred") workflowStatus = "deferred";
  if (lead.status === "contacted") workflowStatus = "invite-sent";
  return {
    ...lead,
    fitCheckStatus,
    inviteLinkStatus,
    workflowStatus,
  };
}

function downstreamInvitePlaceholder(team: Team, slug?: string): string {
  if (slug) {
    return `https://www.example.invalid/volunteer/team-invite?team=${encodeURIComponent(slug)}`;
  }
  return team.teamInviteUrl ?? "[Team invite URL from downstream lead]";
}

export function P5PlacementQueue({ leads, team, memberLabel }: { leads: TeamPowerOfFivePlacementLead[]; team: Team; memberLabel: (memberId: string) => string }) {
  const [rows, setRows] = useState<TeamPowerOfFivePlacementLead[]>(() => leads.map(normalizeLead));
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setRows(leads.map(normalizeLead));
  }, [leads]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  }, []);

  const updateRow = useCallback((id: string, patch: Partial<TeamPowerOfFivePlacementLead>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }, []);

  const copyDownstreamEmail = useCallback(
    (row: TeamPowerOfFivePlacementLead) => {
      const body = buildDownstreamTeamLeadEmail({
        teamLeadName: row.suggestedDownstreamLeadName ?? "[Team lead name]",
        downstreamTeamName: row.suggestedDownstreamTeamName ?? "[Downstream team name]",
        personName: row.name,
        location: row.location,
        interestLine: row.interest,
        connectionSource: row.source,
        senderName: "[Your name]",
      });
      const full = `Subject: ${DOWNSTREAM_LEAD_EMAIL_SUBJECT}\n\n${body}`;
      void navigator.clipboard.writeText(full);
      showToast("Copied downstream fit-check email (subject + body)");
    },
    [showToast],
  );

  const copyNewPersonEmail = useCallback(
    (row: TeamPowerOfFivePlacementLead) => {
      const invite = downstreamInvitePlaceholder(team, row.suggestedDownstreamTeamSlug);
      const qr = team.teamQrCodeUrl ? `QR: ${team.teamQrCodeUrl}` : "QR: [from downstream lead]";
      const body = buildNewPersonPlacementEmail({
        firstName: firstNameFromDisplay(row.name),
        downstreamTeamName: row.suggestedDownstreamTeamName ?? team.displayName,
        inviteLinkOrQrNote: `${invite}\n${qr}`,
        senderName: "[Your name]",
      });
      const full = `Subject: ${NEW_PERSON_EMAIL_SUBJECT}\n\n${body}`;
      void navigator.clipboard.writeText(full);
      showToast("Copied new-person email (subject + body)");
    },
    [showToast, team],
  );

  if (!rows.length) {
    return (
      <p className="font-body text-sm text-kelly-text/70">
        No placement leads in the mock queue. When signups land from forms or field intake, triads can route people here
        before adding them to a specific Power of 5 list.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {toast ? (
        <p className="rounded-lg border border-kelly-success/35 bg-kelly-success/[0.12] px-3 py-2 font-body text-xs text-kelly-deep">{toast}</p>
      ) : null}
      <div className="overflow-x-auto rounded-xl border border-kelly-text/10">
        <table className="min-w-[1080px] w-full border-collapse text-left font-body text-sm">
          <thead>
            <tr className="border-b border-kelly-text/15 bg-kelly-fog/50 text-[10px] font-bold uppercase tracking-wide text-kelly-text/55">
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Location</th>
              <th className="px-3 py-2">Source / relationship</th>
              <th className="px-3 py-2">Owner</th>
              <th className="px-3 py-2">Next step</th>
              <th className="px-3 py-2">Downstream team</th>
              <th className="px-3 py-2">Fit check</th>
              <th className="px-3 py-2">Invite link</th>
              <th className="px-3 py-2">Workflow</th>
              <th className="px-3 py-2">Notes</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="align-top border-b border-kelly-text/10 last:border-0">
                <td className="px-3 py-2 font-medium text-kelly-deep">{row.name}</td>
                <td className="px-3 py-2 text-xs text-kelly-text/80">{row.location}</td>
                <td className="max-w-[200px] px-3 py-2 text-xs text-kelly-text/75">{row.source}</td>
                <td className="px-3 py-2 text-xs text-kelly-text/75">{memberLabel(row.suggestedOwnerMemberId)}</td>
                <td className="px-3 py-2 text-xs font-semibold text-kelly-navy">{NEXT_STEP_LABEL[row.suggestedNextStep]}</td>
                <td className="px-3 py-2 text-xs text-kelly-text/75">
                  {row.suggestedDownstreamTeamName ? (
                    <>
                      {row.suggestedDownstreamTeamSlug ? (
                        <Link
                          href={`/dashboard/team/${row.suggestedDownstreamTeamSlug}`}
                          className="font-semibold text-kelly-blue underline"
                        >
                          {row.suggestedDownstreamTeamName}
                        </Link>
                      ) : (
                        row.suggestedDownstreamTeamName
                      )}
                      {row.suggestedDownstreamLeadName ? (
                        <span className="mt-1 block text-kelly-text/60">Lead: {row.suggestedDownstreamLeadName}</span>
                      ) : null}
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-3 py-2 text-xs">{FIT_LABEL[row.fitCheckStatus ?? "not-applicable"]}</td>
                <td className="px-3 py-2 text-xs">{INVITE_LABEL[row.inviteLinkStatus ?? "none"]}</td>
                <td className="px-3 py-2 text-xs">{WORKFLOW_LABEL[row.workflowStatus ?? "pending-fit-check"]}</td>
                <td className="max-w-[220px] px-3 py-2 text-xs text-kelly-text/70">{row.notes ?? "—"}</td>
                <td className="space-y-1 px-3 py-2">
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => copyDownstreamEmail(row)}
                      className="whitespace-nowrap rounded border border-kelly-navy/20 bg-white px-2 py-1 text-[10px] font-semibold text-kelly-navy hover:bg-kelly-fog"
                    >
                      Copy email · downstream lead
                    </button>
                    <button
                      type="button"
                      onClick={() => copyNewPersonEmail(row)}
                      className="whitespace-nowrap rounded border border-kelly-navy/20 bg-white px-2 py-1 text-[10px] font-semibold text-kelly-navy hover:bg-kelly-fog"
                    >
                      Copy email · new person
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateRow(row.id, { fitCheckStatus: "sent", workflowStatus: "pending-fit-check" });
                        showToast("Marked fit check sent");
                      }}
                      className="whitespace-nowrap rounded border border-kelly-text/15 bg-kelly-page px-2 py-1 text-[10px] font-semibold text-kelly-deep hover:bg-kelly-fog"
                    >
                      Mark fit check sent
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateRow(row.id, { fitCheckStatus: "approved", inviteLinkStatus: "ready-to-send", workflowStatus: "pending-fit-check" });
                        showToast("Marked approved (demo)");
                      }}
                      className="whitespace-nowrap rounded border border-kelly-text/15 bg-kelly-page px-2 py-1 text-[10px] font-semibold text-kelly-deep hover:bg-kelly-fog"
                    >
                      Mark approved
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateRow(row.id, { inviteLinkStatus: "sent", workflowStatus: "invite-sent" });
                        showToast("Marked invite sent");
                      }}
                      className="whitespace-nowrap rounded border border-kelly-text/15 bg-kelly-page px-2 py-1 text-[10px] font-semibold text-kelly-deep hover:bg-kelly-fog"
                    >
                      Mark invite sent
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateRow(row.id, { workflowStatus: "placed", fitCheckStatus: row.fitCheckStatus === "not-applicable" ? "not-applicable" : "approved", inviteLinkStatus: "sent" });
                        showToast("Marked placed");
                      }}
                      className="whitespace-nowrap rounded border border-kelly-success/30 bg-kelly-success/[0.1] px-2 py-1 text-[10px] font-semibold text-kelly-deep hover:bg-kelly-success/20"
                    >
                      Mark placed
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="font-body text-xs text-kelly-text/60">
        Mock actions update this browser view only. Production workflow will persist state and real invite URLs per team (
        <span className="font-mono">teamInviteUrl</span>, <span className="font-mono">teamQrCodeUrl</span>).
      </p>
    </div>
  );
}

export function describePlacementNextStep(step: TeamPowerOfFivePlacementNextStep): string {
  return NEXT_STEP_LABEL[step];
}
