"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { FIELD_PLAYBOOK_NAV } from "@/lib/field-playbook/md-manifest";

function normalizeActiveKey(pathname: string): string {
  const prefix = "/field-playbook";
  if (!pathname.startsWith(prefix)) return "";
  const rest = pathname.slice(prefix.length).replace(/^\/+/, "");
  return rest;
}

export function PublicFieldPlaybookExperience({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const activeKey = normalizeActiveKey(pathname);

  return (
    <div className="bg-kelly-wash">
      <div className="border-b border-kelly-text/10 bg-kelly-navy px-4 py-8 text-white md:px-10 md:py-10 print:hidden">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.32em] text-white/55">Volunteers</p>
        <h1 className="mt-3 font-heading text-2xl font-bold tracking-tight md:text-3xl">Field playbook</h1>
        <p className="mt-3 max-w-3xl font-body text-sm leading-relaxed text-white/80 md:text-base">
          How county, city, precinct, and neighborhood teams fit together — same three roles at every layer. Start at{" "}
          <Link href="/volunteer" className="font-semibold text-kelly-gold underline underline-offset-2 hover:text-white">
            Join the Field Team
          </Link>{" "}
          if you are new.
        </p>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col lg:flex-row">
        <aside className="border-b border-kelly-text/10 bg-white px-4 py-6 lg:sticky lg:top-[calc(var(--site-header-shim)+0.5rem)] lg:z-10 lg:max-h-[calc(100vh-var(--site-header-shim)-1rem)] lg:w-[min(100%,280px)] lg:shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:border-kelly-text/10 lg:px-5 lg:py-8 print:hidden">
          <nav aria-label="Field playbook sections" className="space-y-6">
            {FIELD_PLAYBOOK_NAV.map((section) => (
              <div key={section.id}>
                <p className="px-2 font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-text/50">
                  {section.title}
                </p>
                <ul className="mt-1.5 flex flex-col gap-0.5">
                  {section.items.map((item) => {
                    const href = item.path === "" ? "/field-playbook" : `/field-playbook/${item.path}`;
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
                              ? "bg-kelly-gold/15 text-kelly-navy ring-1 ring-kelly-gold/40"
                              : "text-kelly-text hover:bg-kelly-fog/80 hover:text-kelly-navy"
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
        </aside>
        <div className="min-w-0 flex-1 bg-kelly-page px-4 py-8 md:px-10 md:py-10">{children}</div>
      </div>
    </div>
  );
}
