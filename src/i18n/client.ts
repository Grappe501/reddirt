"use client";

import { usePathname } from "next/navigation";
import { localeFromPathname, withLocaleHref } from "@/i18n/path";
import type { AppLocale } from "@/i18n/types";

export function useLocale(): AppLocale {
  const pathname = usePathname() ?? "/";
  return localeFromPathname(pathname);
}

export function useLocaleHref() {
  const locale = useLocale();
  return (href: string) => withLocaleHref(href, locale);
}
