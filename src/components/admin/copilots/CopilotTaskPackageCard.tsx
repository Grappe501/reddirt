import Link from "next/link";
import type { CopilotTaskPackage } from "@/lib/agents/role-copilots/copilot-intelligence-types";

export function CopilotTaskPackageCard({ pkg }: { pkg: CopilotTaskPackage }) {
  return (
    <article className="rounded-xl border bg-kelly-page p-3 text-sm">
      <div className="flex justify-between gap-2">
        <h4 className="font-bold text-kelly-navy">{pkg.title}</h4>
        <span className="text-[10px] uppercase text-kelly-muted">{pkg.type}</span>
      </div>
      <p className="mt-1 text-xs text-kelly-muted">{pkg.whyItMatters}</p>
      <p className="text-[10px] text-kelly-muted">
        {pkg.estimatedMinutes} min · {pkg.difficulty}
        {pkg.safeOnly ? " · safe only" : ""}
      </p>
      {pkg.humanApprovalGates.length > 0 ? (
        <p className="mt-1 text-[10px] text-amber-900">Gate: {pkg.humanApprovalGates.join(", ")}</p>
      ) : null}
      <ul className="mt-2 flex flex-wrap gap-2">
        {pkg.routeLinks.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-xs font-bold text-kelly-navy underline">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </article>
  );
}
