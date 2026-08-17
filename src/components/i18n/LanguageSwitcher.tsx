"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { chromeText } from "@/i18n/chrome";
import { localeFromPathname, spanishEntryHref, stripLocalePrefix, withLocaleHref } from "@/i18n/path";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  const pathname = usePathname() ?? "/";
  const locale = localeFromPathname(pathname);
  const englishHref = withLocaleHref(stripLocalePrefix(pathname) === "/es" ? "/voter-registration" : stripLocalePrefix(pathname), "en");
  const spanishHref = spanishEntryHref(pathname);
  const dark = tone === "dark";
  const base = dark
    ? "text-[11px] font-semibold uppercase tracking-wide text-white/80"
    : "text-[11px] font-semibold uppercase tracking-wide text-kelly-navy/80";
  const active = dark ? "text-kelly-gold" : "text-kelly-navy";
  const idle = dark ? "text-white/70 hover:text-white" : "text-kelly-navy/60 hover:text-kelly-navy";

  return (
    <nav className={cn("inline-flex items-center gap-1.5", className)} aria-label={chromeText("language", locale)}>
      <Link
        href={englishHref}
        hrefLang="en"
        lang="en"
        className={cn(base, locale === "en" ? active : idle, "min-h-11 inline-flex items-center px-1")}
        aria-current={locale === "en" ? "page" : undefined}
      >
        {chromeText("english", locale)}
      </Link>
      <span className={cn(base, "opacity-40")} aria-hidden>
        |
      </span>
      <Link
        href={spanishHref}
        hrefLang="es"
        lang="es"
        className={cn(base, locale === "es" ? active : idle, "min-h-11 inline-flex items-center px-1")}
        aria-current={locale === "es" ? "page" : undefined}
      >
        {chromeText("espanol", locale)}
      </Link>
    </nav>
  );
}
