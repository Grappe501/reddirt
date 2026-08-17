import { isPublicSpanishStatus, type AppLocale, type LocalizedString } from "@/i18n/types";

export function resolveLocalizedString(entry: LocalizedString, locale: AppLocale): string {
  if (locale !== "es") return entry.en;
  if (!isPublicSpanishStatus(entry.status)) return entry.en;
  return entry.es;
}

export function loc(en: string, es: string, status: LocalizedString["status"] = "native_review"): LocalizedString {
  return { en, es, status };
}
