import { redirect } from "next/navigation";

/** Canonical dossier hub lives at /candidate-dossiers — keep this URL as a redirect. */
export default function OpponentDossiersHubPage() {
  redirect("/admin/intelligence/candidate-dossiers");
}
