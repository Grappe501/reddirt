import Link from "next/link";
import { resolveActiveCampaignTenant } from "@/lib/campaign-tenancy/resolve-active-tenant";
import { AgentObservationTracker } from "@/components/agents/AgentObservationTracker";

export const dynamic = "force-dynamic";

const PORTALS = [
  { id: "event-intake", label: "Event intake portal", href: "/schedule", status: "Live public form" },
  { id: "reimbursement", label: "Reimbursement upload", href: "/admin/campaign-events/reimbursement", status: "Admin treasurer surface" },
  { id: "receipt", label: "Receipt upload", href: "/admin/campaign-events/reimbursement", status: "Finance ops tab" },
  { id: "host", label: "Host dashboard", href: "/admin/candidate-dashboard", status: "Scaffold" },
  { id: "volunteer", label: "Volunteer dashboard", href: "/admin/asks", status: "Scaffold" },
  { id: "coalition", label: "Coalition dashboard", href: "/admin/workbench/comms", status: "Scaffold" },
] as const;

export default async function CampaignPortalsPage() {
  const { tenant, featureFlags } = await resolveActiveCampaignTenant();

  return (
    <AgentObservationTracker role="operator" pathname="/admin/campaign-portals">
      <div className="mx-auto max-w-3xl space-y-6 pb-12 font-body">
        <header className="rounded-3xl border border-kelly-text/10 bg-kelly-page p-6">
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-slate">Sprint 10 · Client portals</p>
          <h1 className="mt-1 font-heading text-2xl font-bold text-kelly-navy">Hosted portal architecture</h1>
          <p className="mt-2 text-sm text-kelly-muted">
            Scaffold for multi-campaign hosted surfaces — full auth overhaul deferred. Active tenant:{" "}
            <strong>{tenant.displayName}</strong>
          </p>
        </header>
        <ul className="space-y-2">
          {PORTALS.map((p) => {
            const enabled =
              (p.id === "event-intake" && featureFlags?.eventIntakePortal) ||
              (p.id === "reimbursement" && featureFlags?.reimbursementPortal) ||
              (p.id === "receipt" && featureFlags?.reimbursementPortal) ||
              (p.id === "volunteer" && featureFlags?.volunteerPortal) ||
              (p.id === "coalition" && featureFlags?.coalitionPortal) ||
              p.id === "host";
            return (
              <li
                key={p.id}
                className={`flex flex-wrap items-center justify-between gap-2 rounded-2xl border px-4 py-3 ${enabled ? "border-kelly-navy/20" : "border-kelly-text/10 opacity-60"}`}
              >
                <div>
                  <p className="font-bold text-kelly-navy">{p.label}</p>
                  <p className="text-xs text-kelly-muted">{p.status}</p>
                </div>
                {enabled ? (
                  <Link href={p.href} className="text-xs font-bold text-kelly-navy underline">
                    Open →
                  </Link>
                ) : (
                  <span className="text-xs text-kelly-subtle">Disabled for tenant</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </AgentObservationTracker>
  );
}
