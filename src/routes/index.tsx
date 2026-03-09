import { createFileRoute } from "@tanstack/react-router";
import { CtaSection } from "../components/landing/CtaSection";
import { FaqsSection } from "../components/landing/FaqsSection";
import { FeaturesSection } from "../components/landing/FeaturesSection";
import { HeroSection } from "../components/landing/HeroSection";
import { LaunchStepsSection } from "../components/landing/LaunchStepsSection";
import { TestimonialSection } from "../components/landing/TestimonialSection";
import "../components/landing/landing.css";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Catalog | Menús digitales y catálogos con QR",
      },
      {
        name: "description",
        content:
          "Crea un menú o catálogo digital con tu propio link y códigos QR para compartir en minutos desde tu negocio.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="landing-root">
      <HeroSection />

      <FeaturesSection />

      <LaunchStepsSection />

      <TestimonialSection />

      <FaqsSection />

      <CtaSection />
    </main>
  );
}
