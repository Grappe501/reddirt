import type { Metadata } from "next";
import { VoterRegistrationCenter } from "@/components/voter/VoterRegistrationCenter";
import { getRequestLocale } from "@/i18n/server";
import { voterRegistrationCopy } from "@/i18n/pages/voter-registration";
import { pageMeta } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return pageMeta({
    title: voterRegistrationCopy("metaTitle", locale),
    description: voterRegistrationCopy("metaDescription", locale),
    path: locale === "es" ? "/es/voter-registration" : "/voter-registration",
  });
}

export default async function VoterRegistrationPage() {
  const locale = await getRequestLocale();
  return <VoterRegistrationCenter locale={locale} />;
}
