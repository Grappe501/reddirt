import type { ReactNode } from "react";

/**
 * Manager chrome — matches official cool page ground (`--color-bg`); body font is Raleway.
 */
export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] font-body text-kelly-text antialiased [font-family:var(--font-body),system-ui,sans-serif] [&_.font-heading]:font-body">
      {children}
    </div>
  );
}
