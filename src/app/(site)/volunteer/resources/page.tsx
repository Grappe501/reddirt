import type { Metadata } from "next";

import { PageHero } from "@/components/blocks/PageHero";
import { Button } from "@/components/ui/Button";
import { VolunteerResourceLibrary } from "@/components/volunteer/VolunteerResourceLibrary";

export const metadata: Metadata = {
  title: "Volunteer Resource Library",
  description:
    "Guides, worksheets, and training materials for building your local team.",
};

export default function VolunteerResourcesPage() {
  return (
    <>
      <PageHero
        eyebrow="Volunteers"
        title="Volunteer Resource Library"
        subtitle="Orientation tools, lane guides, and printables for building your local team."
      >
        <Button href="/volunteer/resources/glossary" variant="outline">
          Glossary
        </Button>
        <Button href="/volunteer/resources/faq" variant="outline">
          New volunteer FAQ
        </Button>
        <Button href="/volunteer" variant="outline">
          Volunteer onboarding
        </Button>
        <Button href="/field-playbook" variant="outline">
          Field playbook
        </Button>
      </PageHero>
      <VolunteerResourceLibrary />
    </>
  );
}
