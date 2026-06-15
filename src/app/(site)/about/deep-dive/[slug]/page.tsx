import { redirect } from "next/navigation";
import { canAccessBiographyDeepDive } from "@/lib/biographyAccess";

type PageProps = { params: Promise<{ slug: string }> };

/** Manuscript deep dives stay offline — redirect to Meet Kelly overview. */
export default async function BiographyDeepDiveRedirectPage({ params }: PageProps) {
  await params;
  if (!canAccessBiographyDeepDive()) redirect("/about");
  redirect("/about");
}
