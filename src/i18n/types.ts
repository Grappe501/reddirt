export type AppLocale = "en" | "es";

export type TranslationReviewStatus = "draft" | "native_review" | "approved";

export type LocalizedString = {
  en: string;
  es: string;
  status: TranslationReviewStatus;
};

/** Spanish reaches the public site only at these statuses. `draft` always falls back to English. */
export const PUBLIC_SPANISH_STATUSES: readonly TranslationReviewStatus[] = [
  "native_review",
  "approved",
];

export function isPublicSpanishStatus(status: TranslationReviewStatus): boolean {
  return PUBLIC_SPANISH_STATUSES.includes(status);
}
