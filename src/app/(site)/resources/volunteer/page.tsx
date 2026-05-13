import { redirect } from "next/navigation";

/** Optional alias → canonical volunteer resource library. */
export default function VolunteerResourcesAliasPage() {
  redirect("/volunteer/resources");
}
