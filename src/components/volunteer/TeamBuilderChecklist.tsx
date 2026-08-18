import type { AppLocale } from "@/i18n/types";
import { volunteerOnboardingCopy, volunteerTeamBuilderChecklist } from "@/i18n/pages/volunteer-onboarding";

type Props = { locale: AppLocale };

export function TeamBuilderChecklist({ locale }: Props) {
  const items = volunteerTeamBuilderChecklist(locale);
  return (
    <div className="rounded-2xl border border-kelly-gold/30 bg-kelly-gold/5 p-6 md:p-8 print:border-kelly-text/20">
      <p className="font-heading text-sm font-bold text-kelly-navy">
        {volunteerOnboardingCopy("beforeLaunchTitle", locale)}
      </p>
      <ul className="mt-4 space-y-3 font-body text-sm leading-relaxed text-kelly-text/90">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-0.5 shrink-0 font-mono text-kelly-gold" aria-hidden>
              □
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
