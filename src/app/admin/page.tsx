import { redirect } from "next/navigation";
import { getAdminLoginDefaultPath } from "@/lib/intelligence/intelligenceLaunchMode";

/** `/admin` — send operators to the right home surface (intelligence hub in debate launch mode). */
export default function AdminRootPage() {
  redirect(getAdminLoginDefaultPath());
}
