import type { ReactNode } from "react";

/** Long-form /about is a single scroll again; chapter routes stay for “READ MORE” deep dives. */
export default function AboutLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
