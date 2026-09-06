import Link from "next/link";
import type { ReactNode } from "react";

import { BookNav } from "@/components/macroscopic-life/BookNav";
import { ML_BASE } from "@/content/macroscopic-life/catalog";

export function BookShell({ children }: { children: ReactNode }) {
  return (
    <div className="ml-shell">
      <header className="ml-top">
        <Link href={ML_BASE} className="ml-wordmark">
          Macroscopic Life
        </Link>
        <BookNav />
      </header>
      <div className="ml-main">{children}</div>
      <footer className="ml-footer">
        Book One is scientifically frozen: macroscopic organization can be real without higher-order
        individuality. Model C is the current result. This surface is not the campaign site.
      </footer>
    </div>
  );
}
