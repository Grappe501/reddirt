import type { AppLocale } from "@/i18n/types";
import { volunteerOnboardingChecklist } from "@/i18n/pages/volunteer-onboarding";

type Props = { locale: AppLocale };

export function OnboardingChecklist({ locale }: Props) {
  const items = volunteerOnboardingChecklist(locale);
  return (
    <ol className="list-decimal space-y-3 pl-6 font-body text-base leading-relaxed text-kelly-text/90">
      {items.map((item) => (
        <li key={item} className="pl-1">
          {item}
        </li>
      ))}
    </ol>
  );
}
