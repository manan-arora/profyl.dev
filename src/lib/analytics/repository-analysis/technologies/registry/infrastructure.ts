import { TechnologyDefinition } from "../technology-types";

export const infrastructureTechnologies: TechnologyDefinition[] = [
  {
    id: "vercel",
    name: "Vercel",
    detection: {
      artifact: ["vercel"],
    },
    signals: ["Infrastructure"],
  },
  {
    id: "render",
    name: "Render",
    detection: {
      artifact: ["render"],
    },
    signals: ["Infrastructure"],
  },
  {
    id: "netlify",
    name: "Netlify",
    detection: {
      artifact: ["netlify"],
    },
    signals: ["Infrastructure"],
  },
  {
    id: "docker",
    name: "Docker",
    detection: {
      artifact: ["dockerfile"],
    },
    signals: ["Infrastructure"],
  },
  {
    id: "docker-compose",
    name: "Docker Compose",
    detection: {
      artifact: ["docker-compose"],
    },
    signals: ["Infrastructure"],
  },
  {
    id: "github-actions",
    name: "GitHub Actions",
    detection: {
      artifact: ["github-actions"],
    },
    signals: ["Infrastructure"],
  },
  {
    id: "terraform",
    name: "Terraform",
    detection: {
      artifact: ["terraform"],
    },
    signals: ["Infrastructure"],
  },
];
