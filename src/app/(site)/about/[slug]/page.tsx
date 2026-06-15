import { redirect } from "next/navigation";
import {
  isKellyAboutSlug,
  type KellyAboutSlug,
} from "@/content/about/kelly-about-chapters";

type PageProps = { params: Promise<{ slug: string }> };

const SLUG_REDIRECT: Record<KellyAboutSlug, string> = {
  story: "/about/journey",
  business: "/about/journey",
  forevermost: "/about/journey",
  "stand-up-arkansas": "/about/community",
  "initiatives-petitions": "/about/community",
  "why-secretary-of-state": "/about/why-im-running",
  "your-part": "/about/why-im-running",
};

/** Former level-3 campaign chapters — content lives on journey / community / why-im-running. */
export default async function AboutChapterRedirectPage({ params }: PageProps) {
  const { slug: raw } = await params;
  if (!isKellyAboutSlug(raw)) redirect("/about");
  redirect(SLUG_REDIRECT[raw as KellyAboutSlug]);
}
