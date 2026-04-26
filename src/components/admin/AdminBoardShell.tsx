import Link from "next/link";
import type { ReactNode } from "react";
import { adminLogoutAction } from "@/app/admin/actions";
import { CampaignPaidForBar } from "@/components/layout/CampaignPaidForBar";

const siteLinks: { href: string; label: string }[] = [
  { href: "/admin/content", label: "Overview" },
  { href: "/admin/homepage", label: "Homepage" },
  { href: "/admin/pages", label: "Page copy" },
  { href: "/admin/stories", label: "Stories" },
  { href: "/admin/editorial", label: "Editorial" },
  { href: "/admin/explainers", label: "Explainers" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/owned-media", label: "Owned media" },
  { href: "/admin/owned-media/grid", label: "Media library grid" },
  { href: "/admin/owned-media/batches", label: "Media ingest batches" },
  { href: "/admin/counties", label: "Counties" },
  { href: "/admin/county-profiles", label: "County profiles" },
  { href: "/admin/county-intelligence", label: "County intel" },
  { href: "/admin/blog", label: "Blog sync" },
  { href: "/admin/settings", label: "Settings" },
];

const operationsLinks: { href: string; label: string }[] = [
  { href: "/admin/workbench", label: "Campaign workbench" },
  { href: "/admin/candidate-briefs", label: "Candidate briefs" },
  { href: "/admin/style-guide", label: "Style & content hub" },
  { href: "/admin/campaign-ops/community-equity", label: "Community equity outreach" },
  { href: "/admin/intelligence", label: "Opposition intelligence (INTEL-3)" },
  { href: "/admin/media-monitor", label: "Press monitor" },
  { href: "/admin/workbench/comms", label: "Comms hub" },
  { href: "/admin/workbench/calendar", label: "Calendar HQ" },
  { href: "/admin/workbench/festivals", label: "Community events feed" },
  { href: "/admin/workbench/social", label: "Social workbench" },
  { href: "/admin/events/community-suggestions", label: "Public event suggestions" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/tasks", label: "Tasks" },
  { href: "/admin/asks", label: "Volunteer asks" },
  { href: "/admin/volunteers/intake", label: "Volunteer sheet intake" },
  { href: "/admin/relational-contacts", label: "Relational contacts (REL-2)" },
  { href: "/admin/gotv", label: "GOTV" },
  { href: "/admin/compliance-documents", label: "Compliance documents" },
  { href: "/admin/financial-transactions", label: "Financial transactions (ledger)" },
  { href: "/admin/budgets", label: "Budget plans (BUDGET-2)" },
];

const orchestratorLinks: { href: string; label: string }[] = [
  { href: "/admin/orchestrator", label: "Command center" },
  { href: "/admin/inbox", label: "Inbox" },
  { href: "/admin/review-queue", label: "Review queue" },
  { href: "/admin/feed", label: "Live feed" },
  { href: "/admin/content-graph", label: "Content graph" },
  { href: "/admin/distribution", label: "Distribution" },
  { href: "/admin/platforms", label: "Platforms" },
  { href: "/admin/settings/platforms", label: "Platform settings" },
  { href: "/admin/media-library", label: "Media library" },
  { href: "/admin/insights", label: "Insights" },
  { href: "/admin/voter-import", label: "Voter file" },
];

export function AdminBoardShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-transparent text-deep-soil">
      <aside className="flex w-[min(100%,280px)] flex-col border-r border-deep-soil/15 bg-deep-soil text-cream-canvas">
        <div className="border-b border-cream-canvas/10 px-5 py-6">
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.28em] text-cream-canvas/55">
            Campaign site admin
          </p>
          <p className="mt-2 font-heading text-lg font-bold leading-tight">Content command center</p>
          <p className="mt-2 font-body text-xs leading-relaxed text-cream-canvas/65">
            Site copy, media, and public-content orchestration — not movement ops dashboards.
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-4 overflow-y-auto px-3 py-4" aria-label="Admin">
          <div>
            <p className="px-3 pb-1 font-body text-[10px] font-bold uppercase tracking-[0.22em] text-cream-canvas/45">
              Campaign operations
            </p>
            <div className="flex flex-col gap-0.5">
              {operationsLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-md px-3 py-2.5 font-body text-sm font-medium text-cream-canvas/90 transition hover:bg-cream-canvas/10 hover:text-cream-canvas"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="px-3 pb-1 font-body text-[10px] font-bold uppercase tracking-[0.22em] text-cream-canvas/45">
              Site content
            </p>
            <div className="flex flex-col gap-0.5">
              {siteLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-md px-3 py-2.5 font-body text-sm font-medium text-cream-canvas/85 transition hover:bg-cream-canvas/10 hover:text-cream-canvas"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="px-3 pb-1 font-body text-[10px] font-bold uppercase tracking-[0.22em] text-cream-canvas/45">
              Orchestrator
            </p>
            <div className="flex flex-col gap-0.5">
              {orchestratorLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-md px-3 py-2.5 font-body text-sm font-medium text-cream-canvas/85 transition hover:bg-cream-canvas/10 hover:text-cream-canvas"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
        <div className="border-t border-cream-canvas/10 p-4">
          <form action={adminLogoutAction}>
            <button
              type="submit"
              className="w-full rounded-md border border-cream-canvas/25 px-3 py-2 font-body text-xs font-semibold uppercase tracking-wider text-cream-canvas/90 transition hover:bg-cream-canvas/10"
            >
              Sign out
            </button>
          </form>
          <Link
            href="/"
            className="mt-3 block text-center font-body text-xs text-cream-canvas/55 underline-offset-2 hover:text-cream-canvas hover:underline"
          >
            View public site
          </Link>
        </div>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <main className="flex-1 px-6 py-10 lg:px-12 lg:py-12">{children}</main>
        <div className="border-t border-deep-soil/10 bg-washed-canvas px-6 py-3 lg:px-12">
          <CampaignPaidForBar variant="light" />
        </div>
      </div>
    </div>
  );
}
