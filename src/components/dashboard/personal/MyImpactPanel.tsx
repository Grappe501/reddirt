import type { PersonalImpactDemo } from "@/lib/power-of-5/personal-dashboard-demo";
import { IMPACT_LADDER_STEPS } from "@/lib/power-of-5/onboarding-demo";
import { CountySectionHeader } from "@/components/county/dashboard/CountySectionHeader";
import { countyDashboardCardClass } from "@/components/county/dashboard/countyDashboardClassNames";
import { CountySourceBadge, formatCountyDashboardNumber } from "@/components/county/dashboard/countyDashboardFormat";
import { cn } from "@/lib/utils";

type Props = {
  impact: PersonalImpactDemo;
  className?: string;
};

/**
 * Personal impact snapshot — ladder position plus headline counts (demo math only).
 */
export function MyImpactPanel({ impact, className }: Props) {
  const idx = Math.max(0, Math.min(IMPACT_LADDER_STEPS.length - 1, impact.ladderStepIndex));
  const step = IMPACT_LADDER_STEPS[idx];

  return (
    <section className={className}>
      <CountySectionHeader
        overline="Impact"
        title="Your momentum"
        description={
          <>
            {impact.caption} <CountySourceBadge source="demo" />
          </>
        }
      />
      <div className={cn(countyDashboardCardClass, "mt-4 border-l-4 border-l-kelly-gold/60")}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-kelly-text/55">Impact ladder — current chapter</p>
        <p className="mt-2 font-heading text-lg font-bold text-kelly-navy">
          {idx + 1}. {step.step}
        </p>
        <p className="mt-1 text-sm text-kelly-text/75">{step.detail}</p>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div className={countyDashboardCardClass}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-kelly-text/55">Conversations (you)</p>
          <p className="mt-1 font-heading text-2xl font-bold text-kelly-navy">
            {formatCountyDashboardNumber(impact.personalConversationsCount)}
          </p>
          <p className="mt-0.5 text-xs text-kelly-text/65">Logged in demo timeline</p>
        </div>
        <div className={countyDashboardCardClass}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-kelly-text/55">Invites extended</p>
          <p className="mt-1 font-heading text-2xl font-bold text-kelly-navy">
            {formatCountyDashboardNumber(impact.invitesExtendedCount)}
          </p>
          <p className="mt-0.5 text-xs text-kelly-text/65">Warm asks, not blasts</p>
        </div>
        <div className={countyDashboardCardClass}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-kelly-text/55">Trusted reach (est.)</p>
          <p className="mt-1 font-heading text-2xl font-bold text-kelly-navy">
            {formatCountyDashboardNumber(impact.estimatedTrustedReach)}
          </p>
          <p className="mt-0.5 text-xs text-kelly-text/65">Narrative aggregate — demo only</p>
        </div>
      </div>
    </section>
  );
}
