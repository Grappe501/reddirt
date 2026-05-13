import type { ReactNode } from "react";

import { FieldPlaybookExperience } from "@/components/admin/field-playbook/FieldPlaybookExperience";

export default function FieldPlaybookLayout({ children }: { children: ReactNode }) {
  return <FieldPlaybookExperience>{children}</FieldPlaybookExperience>;
}
