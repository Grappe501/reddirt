"use client";

import { usePathname } from "next/navigation";
import { IntelligenceNavLink } from "@/components/admin/intelligence/IntelligenceNavLink";
import {
  buildKimHammerTier3NavGroups,
  getKimHammerNavGroupForPath,
} from "@/lib/intelligence/v4/kimHammerOpponentModuleNav";
import { KIM_HAMMER_COMMAND_CENTER_HREF } from "@/lib/opposition/kimHammerBriefingRegistry";
import {
  campaignOsNavHrefBase,
  resolveActiveCampaignOsNavHref,
} from "@/lib/dashboard-orchestration/campaign-os-nav-config";

const chip =
  "rounded border px-2 py-1 text-[10px] font-semibold transition whitespace-nowrap sm:text-xs";
const activeCls = "border-rose-800/40 bg-rose-50 text-rose-950";
const idleCls = "border-kelly-text/15 bg-white text-kelly-slate hover:border-kelly-text/25";
const layerActiveCls = "border-rose-900/50 bg-rose-100 text-rose-950";

/** Domain-grouped subnav for all Kim Hammer module routes — visible in debate launch mode. */
export function IntelligenceKimHammerSubnav() {
  const pathname = usePathname() ?? "";
  const path = pathname.split("?")[0]?.replace(/\/$/, "") ?? "";
  const groups = buildKimHammerTier3NavGroups();
  const currentGroup = getKimHammerNavGroupForPath(path);
  const onHub = path === KIM_HAMMER_COMMAND_CENTER_HREF;

  const activeHref = resolveActiveCampaignOsNavHref(
    pathname,
    groups.flatMap((g) => g.modules.map((m) => ({ href: m.href }))),
  );

  return (
    <nav
      className="mb-6 space-y-2 border-b border-rose-200/60 bg-rose-50/20 pb-3"
      aria-label="Kim Hammer research modules"
    >
      <p className="rounded-lg border border-rose-100 bg-rose-50/60 px-3 py-2 text-xs leading-relaxed text-rose-950">
        <span className="font-bold uppercase text-rose-900">Hammer stack: </span>
        {onHub
          ? "Full KH-0 through KH-4 module map — Kelly stays on debate prep on stage; staff uses retrieval and evidence layers."
          : currentGroup
            ? `${currentGroup.layer} · ${currentGroup.title} — ${currentGroup.description}`
            : "Bill or county drill-down — return to record map for sibling modules."}
      </p>

      <div>
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-rose-900">Layers</p>
        <div className="flex flex-wrap items-center gap-1.5">
          <IntelligenceNavLink
            href={KIM_HAMMER_COMMAND_CENTER_HREF}
            variant="chip"
            className={`${chip} ${onHub ? layerActiveCls : idleCls}`}
          >
            Record map
          </IntelligenceNavLink>
          <IntelligenceNavLink
            href="/admin/intelligence/kim-hammer/debate-prep"
            variant="chip"
            className={`${chip} ${path.startsWith("/admin/intelligence/kim-hammer/debate-prep") ? layerActiveCls : idleCls}`}
          >
            Debate prep
          </IntelligenceNavLink>
          <IntelligenceNavLink
            href="/admin/intelligence/kim-hammer/evidence-command"
            variant="chip"
            className={`${chip} ${path.startsWith("/admin/intelligence/kim-hammer/evidence-command") ? layerActiveCls : idleCls}`}
          >
            Evidence command
          </IntelligenceNavLink>
          {groups.map((group) => {
            const inGroup = currentGroup?.id === group.id;
            return (
              <a
                key={group.id}
                href={`${KIM_HAMMER_COMMAND_CENTER_HREF}#${group.id}`}
                className={`${chip} ${inGroup ? layerActiveCls : idleCls}`}
              >
                {group.layer}
              </a>
            );
          })}
        </div>
      </div>

      {currentGroup ? (
        <div>
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-kelly-subtle">
            {currentGroup.layer} modules
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            {currentGroup.modules.map((mod) => {
              const basePath = campaignOsNavHrefBase(mod.href);
              return (
                <IntelligenceNavLink
                  key={mod.href}
                  href={mod.href}
                  title={mod.summary}
                  variant="chip"
                  className={`${chip} ${activeHref === basePath ? activeCls : idleCls}`}
                >
                  {mod.title}
                </IntelligenceNavLink>
              );
            })}
          </div>
        </div>
      ) : null}
    </nav>
  );
}
