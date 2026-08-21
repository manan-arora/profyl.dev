import { TechnologyDefinition } from "../technology-types";

export const deploymentTechnologies: TechnologyDefinition[] = [
  {
    id: "vercel",
    name: "Vercel",
    detection: {
      artifact: ["vercel"],
    },
    signals: ["Deployment"],
  },
  {
    id: "render",
    name: "Render",
    detection: {
      artifact: ["render"],
    },
    signals: ["Deployment"],
  },
  {
    id: "netlify",
    name: "Netlify",
    detection: {
      artifact: ["netlify"],
    },
    signals: ["Deployment"],
  },
  {
    id: "docker",
    name: "Docker",
    detection: {
      artifact: ["dockerfile"],
    },
    signals: ["Containerization"],
  },
  {
    id: "docker-compose",
    name: "Docker Compose",
    detection: {
      artifact: ["docker-compose"],
    },
    signals: ["Containerization"],
  },
  {
    id: "github-actions",
    name: "GitHub Actions",
    detection: {
      artifact: ["github-actions"],
    },
    signals: ["CI/CD"],
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
