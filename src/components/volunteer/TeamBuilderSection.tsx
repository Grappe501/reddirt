import type { ReactNode } from "react";

import { SectionHeading } from "@/components/blocks/SectionHeading";
import { ContentContainer } from "@/components/layout/ContentContainer";
import type { AppLocale } from "@/i18n/types";
import {
  volunteerBuildDownstreamBullets,
  volunteerBuildGeoBullets,
  volunteerNumberedFlow,
  volunteerOnboardingCopy,
} from "@/i18n/pages/volunteer-onboarding";

import { TeamBuilderChecklist } from "./TeamBuilderChecklist";
import { TeamLevelCard } from "./TeamLevelCard";

function StepCard({ step, title, children }: { step: number; title: string; children: ReactNode }) {
  return (
    <div className="relative flex flex-col rounded-2xl border border-kelly-text/10 bg-white p-5 shadow-[var(--shadow-soft)] md:p-6 print:break-inside-avoid">
      <div className="flex items-start gap-4">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-kelly-navy font-heading text-sm font-bold text-white"
          aria-hidden
        >
          {step}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-base font-bold text-kelly-navy md:text-lg">{title}</h3>
          <div className="mt-3 font-body text-sm leading-relaxed text-kelly-text/85">{children}</div>
        </div>
      </div>
    </div>
  );
}

type Props = { locale: AppLocale };

export function TeamBuilderSection({ locale }: Props) {
  const t = (key: Parameters<typeof volunteerOnboardingCopy>[0]) => volunteerOnboardingCopy(key, locale);
  const numberedFlow = volunteerNumberedFlow(locale);
  const geoBullets = volunteerBuildGeoBullets(locale);
  const downstreamBullets = volunteerBuildDownstreamBullets(locale);
  const bestWhenLabel = t("bestWhenLabel");
  const primaryJobLabel = t("primaryJobLabel");

  return (
    <ContentContainer className="max-w-4xl">
      <SectionHeading
        id="build-three-person-team-heading"
        align="left"
        eyebrow={t("section2Eyebrow")}
        title={t("section2Title")}
        subtitle={t("section2Subtitle")}
      />

      <div className="mt-10 space-y-6">
        <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-stretch">
          <StepCard step={1} title={t("step1Title")}>
            <p>{t("step1Body")}</p>
          </StepCard>
          <div
            className="hidden items-center justify-center font-body text-2xl font-bold text-kelly-gold/80 md:flex"
            aria-hidden
          >
            →
          </div>
          <StepCard step={2} title={t("step2Title")}>
            <p>{t("step2Body")}</p>
          </StepCard>
          <div
            className="hidden items-center justify-center font-body text-2xl font-bold text-kelly-gold/80 md:flex"
            aria-hidden
          >
            →
          </div>
          <StepCard step={3} title={t("step3Title")}>
            <p>{t("step3Body")}</p>
            <p className="mt-3 rounded-lg border border-kelly-navy/15 bg-kelly-navy/[0.04] p-3 text-kelly-deep">
              {t("step3Note")}
            </p>
          </StepCard>
        </div>
        <p className="text-center font-body text-xs text-kelly-text/55 md:hidden" aria-hidden>
          {t("flowMobileHint")}
        </p>
      </div>

      <div className="mt-12 rounded-2xl border border-kelly-text/10 bg-kelly-text/[0.03] p-6 md:p-8">
        <h3 className="font-heading text-lg font-bold text-kelly-navy">{t("buildGeoTitle")}</h3>
        <p className="mt-3 font-body text-base font-semibold text-kelly-deep">{t("buildGeoLead")}</p>
        <ul className="mt-4 list-disc space-y-3 pl-6 font-body text-sm leading-relaxed text-kelly-text/85">
          {geoBullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="mt-4 font-body text-sm leading-relaxed text-kelly-text/85">{t("buildGeoPower")}</p>
      </div>

      <div className="mt-10">
        <h3 className="font-heading text-lg font-bold text-kelly-navy">{t("buildDownstreamTitle")}</h3>
        <p className="mt-3 font-body text-base leading-relaxed text-kelly-text/85">{t("buildDownstreamLead")}</p>
        <p className="mt-4 rounded-xl border-2 border-kelly-gold/50 bg-kelly-gold/10 px-4 py-3 text-center font-heading text-base font-bold text-kelly-navy md:text-lg">
          {t("buildDownstreamMotto")}
        </p>
        <ul className="mt-6 list-disc space-y-2 pl-6 font-body text-sm leading-relaxed text-kelly-text/85">
          {downstreamBullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="mt-12">
        <h3 className="font-heading text-lg font-bold text-kelly-navy">{t("teamLevelsTitle")}</h3>
        <p className="mt-2 font-body text-sm text-kelly-text/70">{t("teamLevelsSubtitle")}</p>
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
          <TeamLevelCard
            title={t("levelCountyTitle")}
            bestWhen={t("levelCountyWhen")}
            primaryJob={t("levelCountyJob")}
            bestWhenLabel={bestWhenLabel}
            primaryJobLabel={primaryJobLabel}
          />
          <TeamLevelCard
            title={t("levelCityTitle")}
            bestWhen={t("levelCityWhen")}
            primaryJob={t("levelCityJob")}
            bestWhenLabel={bestWhenLabel}
            primaryJobLabel={primaryJobLabel}
          />
          <TeamLevelCard
            title={t("levelPrecinctTitle")}
            bestWhen={t("levelPrecinctWhen")}
            primaryJob={t("levelPrecinctJob")}
            bestWhenLabel={bestWhenLabel}
            primaryJobLabel={primaryJobLabel}
          />
          <TeamLevelCard
            title={t("levelNeighborhoodTitle")}
            bestWhen={t("levelNeighborhoodWhen")}
            primaryJob={t("levelNeighborhoodJob")}
            bestWhenLabel={bestWhenLabel}
            primaryJobLabel={primaryJobLabel}
          />
        </div>
      </div>

      <div className="mt-12 rounded-2xl border border-kelly-navy/15 bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
        <h3 className="font-heading text-lg font-bold text-kelly-navy">{t("recommendedFlowTitle")}</h3>
        <ol className="mt-6 list-decimal space-y-3 pl-6 font-body text-sm leading-relaxed text-kelly-text/90">
          {numberedFlow.map((line) => (
            <li key={line} className="pl-1">
              {line}
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-10">
        <TeamBuilderChecklist locale={locale} />
      </div>

      <div className="mt-10 rounded-2xl border border-kelly-navy/20 bg-kelly-navy/[0.04] p-6 md:p-8">
        <h3 className="font-heading text-lg font-bold text-kelly-navy">{t("ruleOfThreeTitle")}</h3>
        <p className="mt-4 font-body text-base leading-relaxed text-kelly-text/85">{t("ruleOfThreeBody")}</p>
      </div>

      <div className="mt-10 rounded-2xl border border-kelly-text/10 bg-kelly-fog/40 p-6 italic md:p-8">
        <h3 className="font-heading text-lg font-bold not-italic text-kelly-navy">{t("exampleTitle")}</h3>
        <p className="mt-4 font-body text-sm leading-relaxed text-kelly-text/90 not-italic">{t("exampleBody")}</p>
      </div>
    </ContentContainer>
  );
}
