import { redirect } from "next/navigation";

export default function VolunteersLegacyRootPage() {
  redirect("/election-plan/operators/leaders/me");
}
