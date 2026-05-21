"use client";

import { useState, type ReactNode } from "react";

export function AiCommandCenterDisclosure({
  id,
  title,
  children,
  defaultOpen = false,
}: {
  id?: string;
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section id={id} className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-5">
      <button
        type="button"
        className="flex w-full items-center justify-between font-heading text-left text-lg font-bold"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {title}
        <span className="text-sm font-normal text-kelly-slate">{open ? "−" : "+"}</span>
      </button>
      {open ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}
