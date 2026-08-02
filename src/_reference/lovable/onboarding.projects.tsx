import { createFileRoute } from "@tanstack/react-router";
import { OnboardingProjects } from "@/components/profyl/OnboardingProjects";
import favicon from "@/assets/profyl-favicon.png.asset.json";

export const Route = createFileRoute("/onboarding/projects")({
  head: () => ({
    meta: [
      { title: "Choose your featured projects — Profyl" },
      {
        name: "description",
        content:
          "Select the GitHub repositories that best represent your engineering work before publishing your Profyl.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Choose your featured projects — Profyl" },
      {
        property: "og:description",
        content: "Curate the repositories that represent your developer identity.",
      },
    ],
    links: [
      { rel: "icon", type: "image/png", href: favicon.url },
      { rel: "apple-touch-icon", href: favicon.url },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  component: OnboardingProjects,
});
