"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { brandMediaFromLegacySite } from "@/config/brand-media";
import { getJoinCampaignHref } from "@/config/external-campaign";
import { primaryNavGroups } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { isExternalHref } from "@/lib/href";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { SearchDialog } from "@/components/search/SearchDialog";
import { NavDesktop } from "@/components/layout/NavDesktop";
import { HeaderCampaignStrip } from "@/components/layout/HeaderCampaignStrip";

function navItemActive(pathname: string, href: string) {
  return pathname === href || (href.length > 1 && pathname.startsWith(`${href}/`));
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [pathway, setPathway] = useState<string | null>(null);
  const panelId = useId();

  useEffect(() => {
    try {
      setPathway(window.localStorage.getItem("reddirt_pathway"));
    } catch {
      setPathway(null);
    }
  }, [pathname]);

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
    <header className="sticky top-0 z-50 w-full border-b border-civic-gold/20 shadow-[0_8px_32px_rgba(12,18,34,0.25)]">
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <HeaderCampaignStrip />
      <div className="border-b border-civic-gold/20 bg-civic-midnight/95 backdrop-blur-md supports-[backdrop-filter]:bg-civic-midnight/90">
        <div className="mx-auto flex w-full max-w-[100vw] items-center justify-between gap-2 px-[var(--gutter-x)] py-3 sm:py-3.5 lg:gap-3 lg:py-4">
        <Link
          href="/"
          aria-label={`${siteConfig.name} — home`}
          className="group flex min-w-0 max-w-[min(100%,18rem)] flex-shrink items-center gap-2.5 sm:max-w-md sm:gap-3 lg:max-w-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-civic-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-civic-midnight"
        >
          <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-civic-gold/30 bg-civic-blue/50 sm:h-12 sm:w-12">
            <Image
              src={brandMediaFromLegacySite.kellyPortrait}
              alt=""
              width={120}
              height={120}
              className="h-full w-full object-cover"
              priority
              unoptimized
            />
          </span>
          <span className="min-w-0 flex flex-col leading-tight">
            <span className="font-heading text-sm font-bold tracking-tight text-civic-mist transition group-hover:text-sunlight-gold sm:text-base lg:text-lg">
            {siteConfig.name}
            </span>
            <span className="mt-0.5 hidden font-body text-[9px] font-medium uppercase tracking-[0.16em] text-civic-mist/55 sm:line-clamp-2 sm:text-[10px] lg:text-[11px]">
            {siteConfig.tagline}
            </span>
          </span>
        </Link>

        <nav
          className="hidden min-w-0 flex-1 items-center justify-end gap-x-0.5 lg:flex xl:gap-x-1.5"
          aria-label="Primary"
        >
          <Button
            type="button"
            variant="ghost"
            className="flex-shrink-0 px-2 py-2 text-xs font-semibold uppercase tracking-wider text-civic-mist/80 hover:text-sunlight-gold xl:px-3"
            onClick={() => setSearchOpen(true)}
          >
            Search
          </Button>
          <NavDesktop groups={primaryNavGroups} pathname={pathname} theme="dark" />
          <Button
            href={getJoinCampaignHref()}
            variant="primary"
            className="ml-0.5 hidden flex-shrink-0 border border-red-dirt/20 px-3 py-2 text-xs font-bold uppercase tracking-wider shadow-soft xl:inline-flex xl:px-4 xl:text-sm"
          >
            Volunteer
          </Button>
          <Button
            href={siteConfig.donateHref}
            variant="outline"
            className="hidden flex-shrink-0 border-2 border-sunlight-gold/80 bg-sunlight-gold/10 px-3 py-2 text-xs font-bold uppercase tracking-wider text-civic-mist hover:border-sunlight-gold hover:bg-sunlight-gold/20 xl:inline-flex xl:px-4 xl:text-sm"
          >
            Donate
          </Button>
          {pathway ? (
            <span className="max-w-[10rem] truncate rounded-full border border-sunlight-gold/30 bg-civic-blue/50 px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-wider text-sunlight-gold/95 xl:max-w-[12rem]">
              {pathway}
            </span>
          ) : null}
        </nav>

        <div className="flex flex-shrink-0 items-center gap-2 lg:hidden">
          <Button
            type="button"
            variant="outline"
            className="border-civic-mist/25 bg-civic-midnight px-3 py-2 text-xs text-civic-mist hover:bg-civic-blue/50"
            onClick={() => setSearchOpen(true)}
          >
            Search
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-civic-mist/25 bg-civic-midnight px-4 py-2 text-xs text-civic-mist hover:bg-civic-blue/50"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((v) => !v)}
          >
            Menu
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
          "fixed inset-0 z-40 bg-civic-midnight/70 transition duration-normal lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
      />

      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-[min(100%,420px)] border-l border-civic-gold/20 bg-civic-midnight text-civic-mist shadow-2xl transition duration-normal lg:hidden",
          open ? "translate-x-0" : "translate-x-full",
        )}
        id={`${panelId}-drawer`}
        onClick={(e) => e.stopPropagation()}
        role="presentation"
      >
        <div className="flex h-full flex-col px-[var(--gutter-x)] py-6">
          <div className="flex items-center justify-between border-b border-civic-gold/20 pb-4">
            <span className="font-heading text-lg font-bold text-civic-mist">Menu</span>
            <Button
              type="button"
              variant="ghost"
              className="text-civic-mist hover:text-sunlight-gold"
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
          </div>
          <nav className="mt-4 flex flex-1 flex-col gap-1 overflow-y-auto" aria-label="Mobile primary">
            {primaryNavGroups.map((group) => (
              <div key={group.id} className="pt-4 first:pt-2">
                <p className="px-3 font-body text-[11px] font-bold uppercase tracking-[0.2em] text-civic-mist/45">
                  {group.label}
                </p>
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
                          "rounded-btn px-3 py-3 font-body text-base font-medium",
                          active
                            ? "bg-civic-blue/60 text-sunlight-gold"
                            : "text-civic-mist/90 hover:bg-civic-blue/40",
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
            <Link
              href={getJoinCampaignHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 rounded-btn bg-red-dirt px-3 py-3 text-center font-body text-base font-bold text-cream-canvas"
              onClick={() => setOpen(false)}
            >
              Volunteer · KellyGrappe.com
            </Link>
            <Link
              href={siteConfig.donateHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-btn border-2 border-sunlight-gold/70 bg-sunlight-gold/10 px-3 py-3 text-center font-body text-base font-bold text-civic-mist"
              onClick={() => setOpen(false)}
            >
              Donate
            </Link>
            <Link
              href="/get-involved"
              className="rounded-btn border border-civic-mist/25 px-3 py-3 text-center font-body text-base font-semibold text-civic-mist/95"
              onClick={() => setOpen(false)}
            >
              Command HQ · this site
            </Link>
            <Link
              href="/"
              className="rounded-btn px-3 py-3 font-body text-base font-medium text-sunlight-gold/95 hover:bg-civic-blue/30"
              onClick={() => setOpen(false)}
            >
              Home
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
