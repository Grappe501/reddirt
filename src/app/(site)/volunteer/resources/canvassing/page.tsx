import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { Button } from "@/components/ui/Button";
import { CanvassingHubContent } from "@/components/volunteer/canvassing/CanvassingHubContent";
import { pageMeta } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMeta({
  title: "Canvassing training",
  description:
    "Door canvassing instructions, Sela Moser's clipboard sheet, Kelly's stance on five kitchen-table issues, and training schedule.",
  path: "/volunteer/resources/canvassing",
});

export default function CanvassingTrainingPage() {
  return (
    <>
      <PageHero
        eyebrow="Volunteer resources"
        title="Canvassing training"
        subtitle="Listen first. Use the clipboard sheet. Know Kelly's stance on the five issues neighbors name — without overpromising what the Secretary of State's office does."
      >
        <Button href="/volunteer/resources/canvassing/clipboard-sheet" variant="primary">
          Clipboard sheet
        </Button>
        <Button href="/get-involved#volunteer" variant="outline">
          Volunteer
        </Button>
        <Button href="/volunteer/resources/messaging" variant="outline">
          Messaging hub
        </Button>
      </PageHero>
      <CanvassingHubContent />
    </>
  );
}
