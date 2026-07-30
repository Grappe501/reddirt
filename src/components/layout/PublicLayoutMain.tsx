import type { ReactNode } from "react";

type Props = { children: ReactNode };

/**
 * Public marketing frame — Fortune-50 gold/sky hairline under the header shim.
 * Content still sits directly in the site shell; this only adds sellable atmosphere.
 */
export function PublicLayoutMain({ children }: Props) {
  return <div className="public-page-frame">{children}</div>;
}
