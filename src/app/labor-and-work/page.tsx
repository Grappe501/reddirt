import { permanentRedirect } from "next/navigation";

/** Former movement page; SOS campaign focuses on office-grounded priorities only. */
export default function LaborAndWorkRedirectPage() {
  permanentRedirect("/priorities");
}
