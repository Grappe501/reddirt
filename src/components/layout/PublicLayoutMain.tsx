import type { ReactNode } from "react";

type Props = { children: ReactNode };

/** Public marketing pages — content sits directly under `SiteHeader` + header shim in `(site)/layout`. */
export function PublicLayoutMain({ children }: Props) {
  return <>{children}</>;
}
