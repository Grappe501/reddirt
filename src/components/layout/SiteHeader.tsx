"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { getVolunteerSignupHref } from "@/config/external-campaign";
import { primaryNavGroups, primaryNavMobileDrawerGroupOrder, voterRegistrationHref } from "@/config/navigation";
import type { NavGroup } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { isExternalHref } from "@/lib/href";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { SearchDialog } from "@/components/search/SearchDialog";
import { HeaderRoundLogo } from "@/components/layout/HeaderRoundLogo";
import { NavDesktop } from "@/components/layout/NavDesktop";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useLocale } from "@/i18n/client";
import { chromeText, localizeNavGroups } from "@/i18n/chrome";
import { withLocaleHref } from "@/i18n/path";

function navItemActive(pathname: string, href: string) {
  return pathname === href || (href.length > 1 && pathname.startsWith(`${href}/`));
}

function navGroupsForMobileDrawer(): NavGroup[] {
  return primaryNavMobileDrawerGroupOrder
    .map((id) => primaryNavGroups.find((g) => g.id === id))
    .filter((g): g is NavGroup => g != null);
}

export function SiteHeader() {
  const pathname = usePathname();
  const locale = useLocale();
  const localizedNavGroups = localizeNavGroups(primaryNavGroups, locale);
  const localizedMobileGroups = localizeNavGroups(navGroupsForMobileDrawer(), locale);
  const localizedVoteHref = withLocaleHref(voterRegistrationHref, locale);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [compactHeader, setCompactHeader] = useState(false);
  const panelId = useId();
  /** Slice 1: same destination as homepage Get Involved Volunteer card. */
  const volunteerHrefRaw = getVolunteerSignupHref();
  const volunteerExternal = isExternalHref(volunteerHrefRaw);
  const volunteerHref = volunteerExternal ? volunteerHrefRaw : withLocaleHref(volunteerHrefRaw, locale);
  const headerRootRef = useRef<HTMLElement | null>(null);

  /** Sets `--site-header-h` (px) so `globals.css` can compute `--site-header-shim` for the layout shim. */
  useLayoutEffect(() => {
    const el = headerRootRef.current;
    if (!el) return;
    const apply = () => {
      // Extra px accounts for subpixel layout, box-shadow, and border stacks vs. a bare height read.
      const h = Math.ceil(el.getBoundingClientRect().height) + 10;
      document.documentElement.style.setProperty("--site-header-h", `${h}px`);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => {
      ro.disconnect();
      document.documentElement.style.removeProperty("--site-header-h");
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setCompactHeader(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!searchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  return (
    <header
      ref={headerRootRef}
      className={cn(
        "fixed left-0 right-0 top-0 z-50 w-full isolate border-b border-kelly-gold/25 transition-[background-color,box-shadow,backdrop-filter] duration-300 ease-out",
        compactHeader
          ? "bg-kelly-navy/94 shadow-[0_6px_28px_rgba(0,0,102,0.42)] backdrop-blur-md backdrop-saturate-125"
          : "bg-kelly-navy shadow-[0_8px_32px_rgba(0,0,102,0.35)]",
      )}
    >
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <div className="relative z-10 border-b border-kelly-gold/20">
        <div
          className={cn(
            "mx-auto flex w-full max-w-[100vw] items-center gap-3 px-[var(--gutter-x)] transition-[padding] duration-300 ease-out xl:gap-4",
            compactHeader ? "py-2 sm:py-2.5 xl:py-3" : "py-3 sm:py-3.5 xl:py-3.5",
          )}
        >
        <Link
          href={withLocaleHref("/", locale)}
          aria-label={`${siteConfig.name} — ${chromeText("home", locale).toLowerCase()}`}
          className="group relative z-20 flex min-w-0 max-w-[11.5rem] shrink-0 items-center gap-2.5 sm:max-w-[14rem] sm:gap-3 xl:max-w-[15.5rem] 2xl:max-w-[17rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kelly-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-kelly-navy"
        >
          <span
            className={cn(
              "relative shrink-0 overflow-hidden rounded-full border border-kelly-gold/25 bg-kelly-blue/40 shadow-[0_0_0_1px_rgba(201,162,39,0.12)_inset] transition-[width,height] duration-300 ease-out",
              compactHeader ? "h-9 w-9 sm:h-10 sm:w-10" : "h-10 w-10 sm:h-11 sm:w-11",
            )}
          >
            <HeaderRoundLogo
              className="h-full w-full shrink-0 transition duration-200 group-hover:brightness-110"
              aria-hidden
            />
          </span>
          <span className="min-w-0 flex flex-col leading-tight text-white">
            <span className="truncate font-heading text-sm font-bold tracking-tight transition group-hover:text-kelly-gold sm:text-[0.95rem] xl:text-base">
              {siteConfig.shortName}
            </span>
            <span className="mt-0.5 truncate font-body text-[9px] font-medium uppercase tracking-[0.12em] text-white/90 sm:text-[10px]">
              {chromeText("forSos", locale)}
            </span>
            <span className="mt-0.5 hidden truncate font-body text-[9px] font-semibold uppercase tracking-[0.16em] text-kelly-gold/90 2xl:block">
              {siteConfig.tagline}
            </span>
          </span>
        </Link>

        <nav
          className="hidden min-w-0 flex-1 items-center justify-end gap-1.5 text-kelly-fog xl:flex 2xl:gap-2.5"
          aria-label="Primary"
        >
          {/*
            Brand is shrink-0 + z-20. Nav lives in min-w-0 flex-1 so it cannot spill over the logo.
            Desktop chrome starts at xl (1280px) — lg was too tight for seven menus + CTAs.
          */}
          <div className="flex min-h-0 min-w-0 flex-1 items-center justify-end overflow-visible pr-0.5">
            <NavDesktop groups={localizedNavGroups} pathname={pathname} theme="dark" />
          </div>
          <LanguageSwitcher className="hidden shrink-0 xl:inline-flex" tone="dark" />
          <Button
            type="button"
            variant="ghostOnDark"
            className="shrink-0 px-2 py-2 text-xs font-semibold tracking-wide 2xl:px-3"
            onClick={() => setSearchOpen(true)}
          >
            {chromeText("search", locale)}
          </Button>
          <Button
            href={localizedVoteHref}
            variant="outlineOnDark"
            title={chromeText("voteRegister", locale)}
            className="hidden min-h-[44px] min-w-0 flex-shrink-0 border border-white/45 bg-transparent px-2.5 py-2 text-xs font-semibold uppercase tracking-wide text-white/95 transition hover:border-white/70 hover:bg-white/10 xl:inline-flex 2xl:min-h-[48px] 2xl:px-3.5 2xl:text-sm"
            aria-label={`${chromeText("voteRegister", locale)} — voter registration center`}
          >
            <span className="2xl:hidden">{chromeText("vote", locale)}</span>
            <span className="hidden 2xl:inline">{chromeText("voteRegister", locale)}</span>
          </Button>
          <Button
            href={volunteerHref}
            target={volunteerExternal ? "_blank" : undefined}
            rel={volunteerExternal ? "noopener noreferrer" : undefined}
            variant="outlineOnDark"
            className="hidden min-h-[44px] flex-shrink-0 border-2 border-white/55 bg-white/10 px-2.5 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition hover:border-white/75 hover:bg-white/16 xl:inline-flex 2xl:min-h-[48px] 2xl:px-3.5 2xl:text-sm"
            aria-label={`${chromeText("volunteer", locale)} — sign up to help the campaign`}
          >
            {chromeText("volunteer", locale)}
          </Button>
          <Button
            href={siteConfig.donateHref}
            variant="primary"
            className="hidden min-h-[44px] min-w-0 flex-shrink-0 px-3 py-2 text-xs font-extrabold uppercase tracking-wide xl:inline-flex 2xl:min-h-[48px] 2xl:px-4 2xl:text-sm"
            aria-label={`${chromeText("donate", locale)} to the campaign`}
          >
            {chromeText("donate", locale)}
          </Button>
        </nav>

        <div className="ml-auto flex max-w-[min(100%,18rem)] flex-shrink-0 flex-wrap items-center justify-end gap-1.5 sm:max-w-none sm:gap-2 text-kelly-fog xl:hidden">
          <LanguageSwitcher className="order-first basis-full justify-end sm:order-none sm:basis-auto" tone="dark" />
          <Button
            href={localizedVoteHref}
            variant="outlineOnDark"
            title={chromeText("voteRegister", locale)}
            className="min-h-[48px] border border-white/45 bg-transparent px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wide text-white sm:px-3 sm:text-xs"
            aria-label={`${chromeText("voteRegister", locale)} — voter registration center`}
          >
            {chromeText("vote", locale)}
          </Button>
          <Button
            href={volunteerHref}
            target={volunteerExternal ? "_blank" : undefined}
            rel={volunteerExternal ? "noopener noreferrer" : undefined}
            variant="outlineOnDark"
            className="min-h-[48px] border-2 border-white/50 bg-white/10 px-2.5 py-2 text-[10px] font-bold uppercase tracking-wide text-white sm:px-3.5 sm:text-xs"
            aria-label={`${chromeText("volunteer", locale)} — sign up`}
          >
            {chromeText("volunteer", locale)}
          </Button>
          <Button
            href={siteConfig.donateHref}
            variant="primary"
            className="min-h-[48px] px-2.5 py-2 text-[10px] font-extrabold uppercase tracking-wide sm:px-3.5 sm:text-xs"
            aria-label={chromeText("donate", locale)}
          >
            {chromeText("donate", locale)}
          </Button>
          <Button
            type="button"
            variant="outlineOnDark"
            className="min-h-[48px] px-2.5 py-2 text-[10px] sm:px-3 sm:text-xs"
            onClick={() => setSearchOpen(true)}
          >
            {chromeText("search", locale)}
          </Button>
          <Button
            type="button"
            variant="outlineOnDark"
            className="min-h-[48px] px-2.5 py-2 text-[10px] sm:px-3 sm:text-xs"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((v) => !v)}
          >
            {chromeText("menu", locale)}
          </Button>
        </div>
        </div>
      </div>

      <div
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        className={cn(
          "fixed inset-0 z-40 bg-kelly-navy/70 transition duration-normal xl:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
      />

      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-[min(100%,420px)] border-l border-kelly-gold/20 bg-kelly-navy text-white shadow-2xl transition duration-normal xl:hidden",
          open ? "translate-x-0" : "translate-x-full",
        )}
        id={`${panelId}-drawer`}
        onClick={(e) => e.stopPropagation()}
        role="presentation"
      >
        <div className="flex h-full flex-col px-[var(--gutter-x)] py-6">
          <div className="flex items-center justify-between border-b border-kelly-gold/20 pb-4">
            <span className="font-heading text-lg font-bold text-white">{chromeText("menu", locale)}</span>
            <Button type="button" variant="ghostOnDark" onClick={() => setOpen(false)}>
              {chromeText("close", locale)}
            </Button>
          </div>
          <nav className="mt-4 flex flex-1 flex-col gap-6 overflow-y-auto pb-6" aria-label="Mobile primary">
            <div>
              <Link
                href={localizedVoteHref}
                className="block min-h-[48px] rounded-btn bg-kelly-gold px-3 py-3 text-center font-body text-base font-bold text-kelly-navy shadow-md transition hover:bg-kelly-gold-soft focus-visible:outline focus-visible:ring-2 focus-visible:ring-kelly-gold/70"
                onClick={() => setOpen(false)}
              >
                {chromeText("voteRegister", locale)}
              </Link>
            </div>

            {localizedMobileGroups.map((group) => (
              <div key={group.id} className="border-t border-kelly-gold/15 pt-4">
                <p className="px-3 font-body text-[11px] font-bold tracking-wide text-white/85">{group.label}</p>
                <div className="mt-2 flex flex-col gap-0.5">
                  {group.items.map((item) => {
                    const active = navItemActive(pathname, item.href);
                    const ext = isExternalHref(item.href);
                    return (
                      <Link
                        key={`${group.id}-${item.label}-${item.href}`}
                        href={item.href}
                        target={ext ? "_blank" : undefined}
                        rel={ext ? "noopener noreferrer" : undefined}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "min-h-[48px] rounded-btn px-3 py-3 font-body text-base font-medium",
                          active ? "bg-kelly-blue/60 text-kelly-gold" : "text-white hover:bg-kelly-blue/40",
                        )}
                        onClick={() => setOpen(false)}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="border-t border-kelly-gold/20 pt-4 space-y-2">
              <Link
                href={volunteerHref}
                target={volunteerExternal ? "_blank" : undefined}
                rel={volunteerExternal ? "noopener noreferrer" : undefined}
                className="block min-h-[48px] rounded-btn border-2 border-white/50 bg-white/10 px-3 py-3 text-center font-body text-base font-bold text-white focus-visible:outline focus-visible:ring-2 focus-visible:ring-kelly-gold/45"
                onClick={() => setOpen(false)}
              >
                {chromeText("volunteer", locale)}
              </Link>
              <Link
                href={siteConfig.donateHref}
                target="_blank"
                rel="noopener noreferrer"
                className="block min-h-[48px] rounded-btn bg-gradient-to-b from-kelly-gold to-[#b8872f] px-3 py-3 text-center font-body text-base font-extrabold text-kelly-navy shadow-[var(--shadow-gold-cta)] focus-visible:outline focus-visible:ring-2 focus-visible:ring-kelly-gold/35"
                onClick={() => setOpen(false)}
              >
                {chromeText("donate", locale)}
              </Link>
              <Button
                type="button"
                variant="ghostOnDark"
                className="min-h-[48px] w-full justify-center rounded-btn border border-white/25 py-3 text-base font-semibold"
                onClick={() => {
                  setOpen(false);
                  setSearchOpen(true);
                }}
              >
                {chromeText("search", locale)}
              </Button>
            </div>

            <Link
              href={withLocaleHref("/", locale)}
              className="mt-2 block rounded-btn px-3 py-3 text-center font-body text-base font-medium text-kelly-gold/95 hover:bg-kelly-blue/30 focus-visible:outline focus-visible:ring-2 focus-visible:ring-kelly-gold/40"
              onClick={() => setOpen(false)}
            >
              {chromeText("home", locale)}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
