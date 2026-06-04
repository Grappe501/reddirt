import Link from "next/link";
import { KimHammerV4ModuleBody } from "@/components/admin/intelligence/kim-hammer/KimHammerV4ModuleBody";
import { V4OperatorGuide } from "@/components/admin/intelligence/v4/V4OperatorGuide";
import { V4BackLinks } from "@/components/admin/intelligence/v4/V4PageHeader";
import {
  getKimHammerV4ModuleEntry,
  shouldRenderKimHammerV4Module,
} from "@/lib/intelligence/kimHammerV4ModuleRegistry";
import { getSurfaceGuide } from "@/lib/intelligence/v4/debateOperatorNarratives";
import {
  buildKimHammerBillBriefing,
  getKimHammerSiblingBriefings,
  loadKimHammerModuleBriefing,
} from "@/lib/opposition/kimHammerModuleBriefings";
import { getKimHammerDomainForModule, KIM_HAMMER_COMMAND_CENTER_HREF } from "@/lib/opposition/kimHammerBriefingRegistry";
import type { KimHammerModuleBriefing } from "@/lib/opposition/kimHammerBriefingTypes";
import { findKimHammerBill } from "@/lib/opposition/kimHammerWorkbench";
import { isIntelligenceOppositionDebateLaunchMode } from "@/lib/intelligence/intelligenceLaunchMode";
import { KimHammerStrategicBriefingPanel } from "./KimHammerStrategicBriefingPanel";

const LAUNCH_MODULE_BRIEFING: KimHammerModuleBriefing = {
  id: "debate-prep",
  domainId: "domain-kh2-debate",
  layer: "Debate week",
  title: "Debate prep",
  eyebrow: "Internal draft · human review required",
  href: "/admin/intelligence/kim-hammer/debate-prep",
  paragraphs: [
    "Sections below load from the election-law JSON packet only — full module briefings are deferred in debate launch mode.",
    "Use verified bill numbers and act references before any public setting.",
  ],
  drillDownLinks: [
    { href: "/admin/intelligence", label: "Start here" },
    { href: "/admin/intelligence/debate-command", label: "Debate command" },
  ],
  evidenceNote: "NON_PUBLISHABLE",
  governanceStatus: "INTERNAL_DRAFT",
};

type KimHammerBriefingPageShellProps = {
  moduleId: string;
  billNumber?: string;
  children: React.ReactNode;
  detailTitle?: string;
};

function Breadcrumb({ briefing }: { briefing: KimHammerModuleBriefing }) {
  const domain = getKimHammerDomainForModule(briefing.id.replace(/^bill-.*$/, "themes"));

  return (
    <nav className="mb-4 flex flex-wrap items-center gap-1 text-[11px] text-kelly-subtle">
      <Link href={KIM_HAMMER_COMMAND_CENTER_HREF} className="font-semibold text-kelly-navy hover:underline">
        Command Center
      </Link>
      {domain ? (
        <>
          <span>/</span>
          <a href={`${KIM_HAMMER_COMMAND_CENTER_HREF}#${domain.id}`} className="font-semibold text-kelly-navy hover:underline">
            {domain.layer}
          </a>
        </>
      ) : null}
      <span>/</span>
      <span className="text-kelly-muted">{briefing.title}</span>
    </nav>
  );
}

export function KimHammerBriefingPageShell({
  moduleId,
  billNumber,
  children,
  detailTitle = "Detailed records & drill-down",
}: KimHammerBriefingPageShellProps) {
  const launchMode = isIntelligenceOppositionDebateLaunchMode();
  const v4Entry = getKimHammerV4ModuleEntry(moduleId);
  const useV4Module = !billNumber && v4Entry && shouldRenderKimHammerV4Module(moduleId, launchMode);

  if (useV4Module && v4Entry) {
    const guide = v4Entry.guideKey ? getSurfaceGuide(v4Entry.guideKey) : undefined;
    return (
      <div className="mx-auto max-w-7xl text-kelly-text">
        <V4BackLinks />
        <header className="mb-6 border-b border-kelly-text/10 pb-4">
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.24em] text-kelly-subtle">
            {v4Entry.eyebrow}
          </p>
          <h1 className="font-heading text-3xl font-bold text-kelly-navy">{v4Entry.title}</h1>
          <p className="mt-2 max-w-4xl text-sm text-kelly-muted">
            P3 v4 module — JSON and markdown packet only. Internal draft; verify act numbers before public use.
          </p>
        </header>
        {guide ? <V4OperatorGuide guide={guide} /> : null}
        <KimHammerV4ModuleBody entry={v4Entry} />
      </div>
    );
  }

  const preserveCustomPage = v4Entry?.preserveCustomPageInLaunchMode;
  const briefing =
    launchMode && !preserveCustomPage
      ? LAUNCH_MODULE_BRIEFING
      : billNumber && findKimHammerBill(billNumber)
      ? buildKimHammerBillBriefing(findKimHammerBill(billNumber)!)
      : loadKimHammerModuleBriefing(moduleId);

  const siblings = launchMode || billNumber ? [] : getKimHammerSiblingBriefings(moduleId, 5);

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <Breadcrumb briefing={briefing} />

      <article className="mb-8 rounded-2xl border border-kelly-navy/15 bg-gradient-to-br from-kelly-page via-white to-kelly-page p-6 shadow-sm lg:p-8">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-subtle">
          {briefing.eyebrow}
        </p>
        <h1 className="mt-2 font-heading text-2xl font-bold text-kelly-navy lg:text-3xl">{briefing.title}</h1>

        <div className="mt-5 max-w-4xl space-y-4 text-sm leading-relaxed">
          {briefing.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 56)} className="text-kelly-muted">
              {paragraph}
            </p>
          ))}
        </div>

        {briefing.narrativeArc && briefing.narrativeArc.length > 0 ? (
          <div className="mt-5 max-w-4xl rounded-lg border border-kelly-navy/10 bg-white/70 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Narrative arc</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-kelly-muted">
              {briefing.narrativeArc.map((line) => (
                <li key={line.slice(0, 48)}>{line}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {briefing.operatorTakeaway ? (
          <div className="mt-5 max-w-4xl rounded-lg border-l-4 border-kelly-gold bg-white/80 px-4 py-3 text-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Operator takeaway</p>
            <p className="mt-1 font-medium text-kelly-navy">{briefing.operatorTakeaway}</p>
          </div>
        ) : null}

        {briefing.drillDownLinks.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {briefing.drillDownLinks.map((item) => (
              <a
                key={item.href + item.label}
                href={item.href}
                className="rounded border border-kelly-text/15 bg-white px-3 py-1.5 text-[11px] font-semibold text-kelly-navy hover:bg-kelly-page"
              >
                {item.label} →
              </a>
            ))}
          </div>
        ) : null}

        {briefing.evidenceNote ? (
          <p className="mt-4 text-[10px] uppercase tracking-wider text-kelly-subtle">
            Evidence: {briefing.evidenceNote}
          </p>
        ) : null}
      </article>

      {briefing.strategicBriefing ? (
        <KimHammerStrategicBriefingPanel
          strategicBriefing={briefing.strategicBriefing}
          governanceStatus={briefing.governanceStatus}
        />
      ) : null}

      {siblings.length > 0 ? (
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-kelly-navy">Related modules in this domain</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {siblings.map((s) => (
              <Link
                key={s.id}
                href={s.href}
                className="rounded border border-kelly-text/10 bg-white px-2.5 py-1 text-[11px] font-semibold text-kelly-navy hover:bg-kelly-page"
              >
                {s.title}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section id="detail" className="scroll-mt-6 border-t border-kelly-text/10 pt-6">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-kelly-navy">{detailTitle}</h2>
        {children}
      </section>
    </div>
  );
}
