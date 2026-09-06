import Link from "next/link";
import type { ReactNode } from "react";

import { BookNav } from "@/components/macroscopic-life/BookNav";
import { FieldBackdrop } from "@/components/macroscopic-life/FieldBackdrop";
import { ML_BASE } from "@/content/macroscopic-life/catalog";

export function BookShell({ children }: { children: ReactNode }) {
  return (
    <div className="ml-shell">
      <FieldBackdrop />
      <header className="ml-top">
        <Link href={ML_BASE} className="ml-wordmark">
          Macroscopic Life
          <small>Book One instrument</small>
        </Link>
        <BookNav />
      </header>
      <p className="ml-status">
        <span>Model C lock</span>
        <span>16 chapters</span>
        <span>18 figures</span>
        <span>11 tests · no organism score</span>
      </p>
      <div className="ml-main">{children}</div>
      <footer className="ml-footer">
        Scientifically frozen. Model C is the current result: organization can be real without a new
        individual. This is not the campaign site.
      </footer>
    </div>
  );
}
