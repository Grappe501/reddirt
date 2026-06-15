import { redirect } from "next/navigation";
import { showPublicBiographyManuscript } from "@/config/public-biography-depth";

export const dynamic = "force-dynamic";

/** Full manuscript biography hidden until campaign re-enables depth 4. */
export default function BiographyPage() {
  if (!showPublicBiographyManuscript()) {
    redirect("/about");
  }
  redirect("/about");
}
