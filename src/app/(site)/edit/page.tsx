import { redirect } from "next/navigation";

/** Public /edit used to turn on inline site editing. That is closed. */
export default function SiteEditEntryPage() {
  redirect("/");
}
