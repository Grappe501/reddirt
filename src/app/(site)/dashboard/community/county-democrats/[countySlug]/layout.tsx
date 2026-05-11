import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { CountyDemocratsShell } from "@/components/dashboard/community/county-democrats/CountyDemocratsShell";
import {
  getRegistryCountyBySlug,
  isValidArkansasCountySlug,
} from "@/lib/county/arkansas-county-registry";

type Props = { children: ReactNode; params: Promise<{ countySlug: string }> };

export default async function CountyDemocratsCountyLayout({ children, params }: Props) {
  const { countySlug } = await params;
  if (!isValidArkansasCountySlug(countySlug)) notFound();
  const reg = getRegistryCountyBySlug(countySlug);
  if (!reg) notFound();

  return (
    <CountyDemocratsShell countySlug={countySlug} countyDisplayName={reg.displayName}>
      {children}
    </CountyDemocratsShell>
  );
}
