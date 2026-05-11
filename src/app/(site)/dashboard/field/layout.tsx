import type { ReactNode } from "react";

import { FieldCommandChrome } from "@/components/dashboard/field/FieldCommandChrome";

export default function FieldCommandLayout({ children }: { children: ReactNode }) {
  return <FieldCommandChrome>{children}</FieldCommandChrome>;
}
