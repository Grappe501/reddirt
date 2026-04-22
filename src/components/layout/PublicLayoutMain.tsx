import { headers } from "next/headers";
import { RoadAtmosphereStrip } from "@/components/layout/RoadAtmosphereStrip";
import { isCampaignHomePath } from "@/config/campaign-brand";

type Props = { children: React.ReactNode };

/**
 * Injects the sitewide road imagery band for every **public** route. Admin and API routes
 * are excluded (middleware sets `x-pathname` only for document routes — see `middleware.ts`).
 */
export async function PublicLayoutMain({ children }: Props) {
  const h = await headers();
  const path = h.get("x-pathname") ?? "/";
  if (path.startsWith("/admin")) {
    return <>{children}</>;
  }
  // API and RSC fetches: skip strip on non-page navigations
  if (path.startsWith("/api") || path.startsWith("/_next")) {
    return <>{children}</>;
  }
  // Home already has a full-bleed hero; omit the road band so the fold is nav → hero, not stacked strips.
  const showRoadBand = !isCampaignHomePath(path);
  return (
    <>
      {showRoadBand ? <RoadAtmosphereStrip pathname={path} /> : null}
      {children}
    </>
  );
}
