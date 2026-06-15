import { redirect } from "next/navigation";
import {
  OFFICE_AREA_SLUGS,
  getOfficeArea,
  isOfficeAreaSlug,
  officeLayerPath,
} from "@/content/office/office-three-layer";

type PageProps = { params: Promise<{ slug: string }> };

/** Former layer 3 — merged into why-it-matters (two-level office architecture). */
export default async function OfficeAreaLayerThreeRedirectPage({ params }: PageProps) {
  const { slug: raw } = await params;
  if (!isOfficeAreaSlug(raw)) redirect("/understand");
  const area = getOfficeArea(raw);
  if (!area) redirect("/understand");
  redirect(officeLayerPath(area.slug, 2));
}
