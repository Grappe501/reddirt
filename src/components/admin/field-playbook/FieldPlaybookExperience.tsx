"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { FIELD_PLAYBOOK_NAV } from "@/lib/field-playbook/md-manifest";

function normalizeActiveKey(pathname: string): string {
  const prefix = "/admin/field-playbook";
  if (!pathname.startsWith(prefix)) return "";
  const rest = pathname.slice(prefix.length).replace(/^\/+/, "");
  return rest;
}

export function FieldPlaybookExperience({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const activeKey = normalizeActiveKey(pathname);

  return (
    <div className="-mx-6 -mt-4 lg:-mx-12">
      <div className="rounded-2xl border border-kelly-text/10 bg-gradient-to-b from-white via-kelly-fog/40 to-kelly-mist/30 shadow-[var(--shadow-card)] print:shadow-none print:border-kelly-text/20">
        <div className="border-b border-kelly-text/10 bg-kelly-deep px-6 py-8 text-white print:hidden md:px-10 md:py-10">
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.32em] text-white/55">
            Internal · Field & volunteer operations
          </p>
          <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight md:text-4xl">
            Three-person exponential field plan
          </h1>
          <p className="mt-3 max-w-3xl font-body text-sm leading-relaxed text-white/75 md:text-base">
            Fractal teams (events, social, relational) from state to neighborhood — written so volunteers know exactly
            what to execute week over week. Source material lives in{" "}
            <code className="rounded bg-white/10 px-1 py-0.5 text-[11px] text-white/85">field-structure/playbook/</code>
            .
          </p>
          <div className="mt-6 h-px w-24 bg-kelly-gold/80" aria-hidden />
        </div>

        <div className="flex flex-col lg:flex-row">
          <aside className="border-b border-kelly-text/10 bg-kelly-deep/97 px-4 py-6 text-white print:hidden lg:sticky lg:top-4 lg:z-10 lg:max-h-[calc(100vh-2rem)] lg:w-[min(100%,300px)] lg:shrink-0 lg:overflow-y-auto lg:overscroll-y-contain lg:border-b-0 lg:border-r lg:border-kelly-text/10 lg:px-5 lg:self-start">
            <nav aria-label="Field playbook" className="space-y-6">
              {FIELD_PLAYBOOK_NAV.map((section) => (
                <div key={section.id}>
                  <p className="px-2 font-body text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">
                    {section.title}
                  </p>
                  <ul className="mt-1.5 flex flex-col gap-0.5">
                    {section.items.map((item) => {
                      const href =
                        item.path === "" ? "/admin/field-playbook" : `/admin/field-playbook/${item.path}`;
                      const isActive =
                        item.path === activeKey ||
                        (item.path === "" && activeKey === "") ||
                        (item.path !== "" && activeKey === item.path);
                      return (
                        <li key={item.path || "hub"}>
                          <Link
                            href={href}
                            className={`block rounded-lg px-3 py-2.5 font-body text-sm font-medium transition ${
                              isActive
                                ? "bg-kelly-gold/20 text-white ring-1 ring-kelly-gold/50"
                                : "text-white/80 hover:bg-white/10 hover:text-white"
                            }`}
                          >
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
            <p className="mt-8 border-t border-white/10 px-2 pt-6 font-body text-[11px] leading-relaxed text-white/45">
              Assign coordinators to expand chapters as field learns. Keep checklists concrete; avoid sensitive voter data
              in these pages.
            </p>
          </aside>

          <div className="min-w-0 flex-1 px-5 py-8 print:px-2 md:px-10 md:py-10">{children}</div>
        </div>
      </div>
    </div>
  );
}
