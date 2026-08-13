import type { Metadata } from "next";
import { PageHero } from "@/components/blocks/PageHero";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { Button } from "@/components/ui/Button";
import { pageMeta } from "@/lib/seo/metadata";

export const metadata: Metadata = pageMeta({
  title: "Información para votantes",
  description:
    "Recursos oficiales para registrarse y verificar su registro de votante en Arkansas, en un camino en español.",
  path: "/es",
});

export default function SpanishVoterPathPage() {
  return (
    <div lang="es">
      <PageHero
        eyebrow="Español"
        title="Información para votantes"
        subtitle="Un camino claro hacia los recursos oficiales de Arkansas. Esta campaña no reemplaza a la oficina del Secretario de Estado ni a su secretario del condado."
      >
        <Button href="https://www.voterview.ar-nova.org/VoterView/" variant="primary">
          Verificar mi registro
        </Button>
        <Button href="/voter-registration" variant="outline">
          Registrarse para votar
        </Button>
      </PageHero>

      <FullBleedSection padY>
        <ContentContainer className="max-w-3xl">
          <h2 className="font-heading text-2xl font-bold text-kelly-ink">Servicios de alto valor</h2>
          <ul className="mt-6 list-disc space-y-3 pl-5 font-body text-base leading-relaxed text-kelly-slate">
            <li>Verifique su registro, lugar de votación y boleta en el sistema oficial VoterView de Arkansas.</li>
            <li>Use el centro de registro de esta campaña para orientación y el enlace oficial.</li>
            <li>
              Preguntas sobre la administración electoral: su secretario del condado y sos.arkansas.gov son las fuentes
              oficiales.
            </li>
          </ul>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/get-involved" variant="outline">
              Participar
            </Button>
            <Button href="/contact" variant="outline">
              Contacto
            </Button>
            <Button href="/" variant="outline">
              English
            </Button>
          </div>
        </ContentContainer>
      </FullBleedSection>
    </div>
  );
}
