import { redirect } from "next/navigation";

/** Community page is off the public site for now. */
export default function AboutCommunityRedirectPage() {
  redirect("/about");
}
