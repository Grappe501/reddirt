import type { ReactNode } from "react";

/**
 * Flat background + single UI font stack so manager surfaces match Inter-dense tooling
 * (root body still loads heading variable for rare serif use inside admin).
 */
export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f2ebe2] font-body text-deep-soil antialiased [font-family:var(--font-body),system-ui,sans-serif] [&_.font-heading]:font-body">
      {children}
    </div>
  );
}
