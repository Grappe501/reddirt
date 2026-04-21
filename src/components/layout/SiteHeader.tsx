"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { getJoinCampaignHref } from "@/config/external-campaign";
import { primaryNavGroups } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { isExternalHref } from "@/lib/href";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { SearchDialog } from "@/components/search/SearchDialog";
import { NavDesktop } from "@/components/layout/NavDesktop";

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
    <header className="sticky top-0 z-50 w-full border-b border-deep-soil/10 bg-cream-canvas/90 backdrop-blur-md">
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <div className="mx-auto flex w-full max-w-[100vw] items-center justify-between gap-3 px-[var(--gutter-x)] py-4 lg:gap-4 lg:py-5">
        <Link
          href="/"
          className="group flex min-w-0 flex-shrink flex-col leading-none focus-visible:outline-none"
        >
          <span className="font-heading text-base font-bold tracking-tight text-deep-soil transition group-hover:text-red-dirt sm:text-lg lg:text-xl">
            {siteConfig.name}
          </span>
          <span className="mt-1 hidden font-body text-[10px] font-medium uppercase tracking-[0.18em] text-deep-soil/50 sm:block lg:text-[11px]">
            {siteConfig.tagline}
          </span>
        </Link>

        <nav
          className="hidden min-w-0 flex-1 items-center justify-end gap-x-1 lg:flex xl:gap-x-2"
          aria-label="Primary"
        >
          <Button
            type="button"
            variant="ghost"
            className="flex-shrink-0 px-2 py-2 text-xs font-semibold uppercase tracking-wider text-deep-soil/70 xl:px-3"
            onClick={() => setSearchOpen(true)}
          >
            Search
          </Button>
          <NavDesktop groups={primaryNavGroups} pathname={pathname} />
          <Button
            href={getJoinCampaignHref()}
            variant="primary"
            className="ml-1 hidden flex-shrink-0 px-3 py-2 text-xs font-bold uppercase tracking-wider shadow-soft xl:inline-flex xl:px-4 xl:text-sm"
          >
            Volunteer
          </Button>
          <Button
            href={siteConfig.donateHref}
            variant="outline"
            className="hidden flex-shrink-0 border-2 border-sunlight-gold/80 bg-sunlight-gold/15 px-3 py-2 text-xs font-bold uppercase tracking-wider text-deep-soil hover:bg-sunlight-gold/35 xl:inline-flex xl:px-4 xl:text-sm"
          >
            Donate
          </Button>
          {pathway ? (
            <span className="max-w-[10rem] truncate rounded-full border border-field-green/35 bg-field-green/10 px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-wider text-field-green xl:max-w-[12rem]">
              {pathway}
            </span>
          ) : null}
        </nav>

        <div className="flex flex-shrink-0 items-center gap-2 lg:hidden">
          <Button
            type="button"
            variant="outline"
            className="px-3 py-2 text-xs"
            onClick={() => setSearchOpen(true)}
          >
            Search
          </Button>
          <Button
            type="button"
            variant="outline"
            className="px-4 py-2 text-xs"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((v) => !v)}
          >
            Menu
          </Button>
        </div>
      </div>

      <div
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        className={cn(
          "fixed inset-0 z-40 bg-deep-soil/60 transition duration-normal lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
      />

      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-[min(100%,420px)] bg-cream-canvas shadow-2xl transition duration-normal lg:hidden",
          open ? "translate-x-0" : "translate-x-full",
        )}
        id={`${panelId}-drawer`}
        onClick={(e) => e.stopPropagation()}
        role="presentation"
      >
        <div className="flex h-full flex-col px-[var(--gutter-x)] py-6">
          <div className="flex items-center justify-between border-b border-deep-soil/10 pb-4">
            <span className="font-heading text-lg font-bold text-deep-soil">Menu</span>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
          <nav className="mt-4 flex flex-1 flex-col gap-1 overflow-y-auto" aria-label="Mobile primary">
            {primaryNavGroups.map((group) => (
              <div key={group.id} className="pt-4 first:pt-2">
                <p className="px-3 font-body text-[11px] font-bold uppercase tracking-[0.2em] text-deep-soil/45">
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
                          "rounded-btn px-3 py-3 font-body text-base font-medium hover:bg-deep-soil/5",
                          active ? "bg-red-dirt/10 text-red-dirt" : "text-deep-soil",
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
              className="rounded-btn border-2 border-sunlight-gold/70 bg-sunlight-gold/15 px-3 py-3 text-center font-body text-base font-bold text-deep-soil"
              onClick={() => setOpen(false)}
            >
              Donate
            </Link>
            <Link
              href="/get-involved"
              className="rounded-btn border border-deep-soil/20 px-3 py-3 text-center font-body text-base font-semibold text-deep-soil"
              onClick={() => setOpen(false)}
            >
              Command HQ · this site
            </Link>
            <Link
              href="/"
              className="rounded-btn px-3 py-3 font-body text-base font-medium text-red-dirt hover:bg-red-dirt/10"
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
