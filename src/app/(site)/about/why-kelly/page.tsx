import { redirect } from "next/navigation";

/** Legacy route — canonical path is /about/why-im-running */
export default function WhyKellyRedirectPage() {
  redirect("/about/why-im-running");
}
