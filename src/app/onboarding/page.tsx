"use client";

import { useEffect, useState } from "react";
import { OnboardingProjects, Repo } from "@/components/onboarding/OnboardingProjects";

// TODO: Replace this mock data in Phase 3B with actual database data fetched from the API / Server Components
const MOCK_REPOSITORIES: Repo[] = [
  {
    id: "repo-1",
    name: "vector-search",
    description: "High-performance vector database client with automated index mapping and cosine similarity calculations.",
    primaryLanguage: "Rust",
    topics: ["Tokio", "gRPC", "VectorDb"],
    stars: 1420,
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    id: "repo-2",
    name: "k8s-pod-scaler",
    description: "Kubernetes controller that dynamically scales replica sets based on custom latency metrics.",
    primaryLanguage: "Go",
    topics: ["Kubernetes", "CRD", "ClientGo"],
    stars: 620,
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
  },
  {
    id: "repo-3",
    name: "orbit-ui-react",
    description: "Keyboard-first headless React components optimized for high-density dashboard layouts.",
    primaryLanguage: "TypeScript",
    topics: ["React", "Radix", "TailwindCSS"],
    stars: 890,
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
  },
  {
    id: "repo-4",
    name: "sift-db",
    description: "Double-entry transactional ledger implementation with append-only logs and cryptographic audit trail.",
    primaryLanguage: "TypeScript",
    topics: ["Postgres", "Drizzle", "Prisma"],
    stars: 310,
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
  },
  {
    id: "repo-5",
    name: "neural-sketcher",
    description: "Generative Stable Diffusion frontend with canvas editing tools and real-time inference support.",
    primaryLanguage: "Python",
    topics: ["PyTorch", "FastAPI", "WebSockets"],
    stars: 2450,
    updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
  },
  {
    id: "repo-6",
    name: "ledger-core",
    description: "Ultra-fast double entry general ledger with immutable audit records and replay capabilities.",
    primaryLanguage: "Go",
    topics: ["Go", "SQLite", "Protobuf"],
    stars: 125,
    updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
  },
  {
    id: "repo-7",
    name: "edge-typed-router",
    description: "Zero-overhead typed routing library for Cloudflare Workers and Hono frameworks.",
    primaryLanguage: "TypeScript",
    topics: ["Cloudflare", "Hono", "TypeScript"],
    stars: 520,
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  },
];

export default function OnboardingPage() {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial loading to demonstrate visual skeletons
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1100);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = (selectedIds: string[]) => {
    console.log("Onboarding completed: Chosen repositories:", selectedIds);
    alert(`Visual Development Action Triggered!\nFeatured repositories: ${JSON.stringify(selectedIds)}`);
  };

  const handleResync = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <OnboardingProjects
      repositories={MOCK_REPOSITORIES}
      isLoading={isLoading}
      onContinue={handleContinue}
      onResync={handleResync}
    />
  );
}
