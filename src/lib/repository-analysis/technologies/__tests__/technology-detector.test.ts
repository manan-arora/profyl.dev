import { describe, it, expect } from "vitest";
import { detectTechnologies } from "../technology-detector";
import { ParsedManifest, DiscoveredArtifact } from "@/types/scanner";

describe("detectTechnologies", () => {
  // Helper to construct a parsed manifest easily
  const createManifest = (
    path: string,
    type: ParsedManifest["manifest"]["type"],
    dependencies: string[]
  ): ParsedManifest => ({
    manifest: { path, type },
    dependencies,
  });

  // Helper to construct a discovered artifact easily
  const createArtifact = (
    path: string,
    type: DiscoveredArtifact["type"]
  ): DiscoveredArtifact => ({
    path,
    type,
  });

  // 1. Every registry category & 2. Representative identifiers from every supported ecosystem
  it("should match representative identifiers from every category and ecosystem", () => {
    const manifests: ParsedManifest[] = [
      createManifest("package.json", "package.json", ["react", "@nestjs/core", "mongodb", "bullmq"]),
      createManifest("requirements.txt", "requirements.txt", ["django", "Flask", "pymongo", "celery"]),
      createManifest("pom.xml", "pom.xml", ["org.postgresql:postgresql", "org.springframework.boot:spring-boot-starter-security"]),
      createManifest("build.gradle", "build.gradle", ["org.hibernate.orm:hibernate-core"]),
      createManifest("go.mod", "go.mod", ["github.com/gin-gonic/gin", "github.com/redis/go-redis/v9"]),
    ];

    const artifacts: DiscoveredArtifact[] = [
      createArtifact("Dockerfile", "dockerfile"),
      createArtifact("vercel.json", "vercel"),
    ];

    const results = detectTechnologies(manifests, artifacts);

    // Verify presence of technologies by canonical ID
    const detectedIds = results.map((r) => r.technologyId);

    // Application Stack
    expect(detectedIds).toContain("react");
    expect(detectedIds).toContain("nestjs");
    expect(detectedIds).toContain("django");
    expect(detectedIds).toContain("flask");
    expect(detectedIds).toContain("gin");

    // Database
    expect(detectedIds).toContain("mongodb");
    expect(detectedIds).toContain("postgresql");
    expect(detectedIds).toContain("hibernate");

    // Authentication
    expect(detectedIds).toContain("spring-security");

    // Infrastructure
    expect(detectedIds).toContain("docker");
    expect(detectedIds).toContain("vercel");

    // Caching
    expect(detectedIds).toContain("redis");

    // Background Jobs
    expect(detectedIds).toContain("bullmq");
    expect(detectedIds).toContain("celery");
  });

  // 3. Multiple identifiers resolving to the same canonical technology
  it("should resolve multiple identifiers to the same canonical technology", () => {
    const manifests = [
      createManifest("package.json", "package.json", ["react", "react-dom"]),
    ];
    const results = detectTechnologies(manifests, []);
    expect(results).toHaveLength(1);
    expect(results[0].technologyId).toBe("react");
    expect(results[0].evidence).toHaveLength(2);
    expect(results[0].evidence.map((e) => e.identifier)).toContain("react");
    expect(results[0].evidence.map((e) => e.identifier)).toContain("react-dom");
  });

  // 4. Multiple manifests producing one technology
  it("should merge evidence when multiple manifests produce the same technology", () => {
    const manifests = [
      createManifest("apps/web/package.json", "package.json", ["pg"]),
      createManifest("services/api/requirements.txt", "requirements.txt", ["psycopg2"]),
      createManifest("backend/pom.xml", "pom.xml", ["org.postgresql:postgresql"]),
    ];
    const results = detectTechnologies(manifests, []);
    const postgres = results.find((r) => r.technologyId === "postgresql");
    expect(postgres).toBeDefined();
    expect(postgres!.evidence).toHaveLength(3);
    expect(postgres!.evidence.map((e) => e.path)).toContain("apps/web/package.json");
    expect(postgres!.evidence.map((e) => e.path)).toContain("services/api/requirements.txt");
    expect(postgres!.evidence.map((e) => e.path)).toContain("backend/pom.xml");
  });

  // 5. Artifact identifiers resolving correctly
  it("should resolve artifact identifiers correctly", () => {
    const artifacts = [
      createArtifact("vercel.json", "vercel"),
      createArtifact("Dockerfile", "dockerfile"),
    ];
    const results = detectTechnologies([], artifacts);
    expect(results).toHaveLength(2);
    expect(results.map((r) => r.technologyId)).toContain("vercel");
    expect(results.map((r) => r.technologyId)).toContain("docker");
  });

  // 6. Next.js producing both Frontend and Backend
  it("should assign both Frontend and Backend signals to Next.js", () => {
    const manifests = [createManifest("package.json", "package.json", ["next"])];
    const results = detectTechnologies(manifests, []);
    const nextjs = results.find((r) => r.technologyId === "nextjs");
    expect(nextjs).toBeDefined();
    expect(nextjs!.signals).toContain("Frontend");
    expect(nextjs!.signals).toContain("Backend");
    expect(nextjs!.signals).toHaveLength(2);
  });

  // 7. Django producing only Backend
  it("should assign only Backend signal to Django", () => {
    const manifests = [createManifest("requirements.txt", "requirements.txt", ["django"])];
    const results = detectTechnologies(manifests, []);
    const django = results.find((r) => r.technologyId === "django");
    expect(django).toBeDefined();
    expect(django!.signals).toContain("Backend");
    expect(django!.signals).toHaveLength(1);
  });

  // 8. Supabase producing Database, not Authentication
  it("should assign only Database signal to Supabase", () => {
    const manifests = [createManifest("package.json", "package.json", ["@supabase/supabase-js"])];
    const results = detectTechnologies(manifests, []);
    const supabase = results.find((r) => r.technologyId === "supabase");
    expect(supabase).toBeDefined();
    expect(supabase!.signals).toContain("Database");
    expect(supabase!.signals).not.toContain("Authentication");
  });

  // 9. Generic Firebase not producing Authentication
  it("should not detect firebase as technology or assign signals from generic firebase packages or artifacts", () => {
    const manifests = [createManifest("package.json", "package.json", ["firebase"])];
    const artifacts = [createArtifact("firebase.json", "firebase")];
    const results = detectTechnologies(manifests, artifacts);
    // Neither "firebase" npm package nor "firebase" artifact is mapped to any technology,
    // so results should be empty.
    expect(results).toHaveLength(0);
  });

  // 10. jsonwebtoken/jose not producing Authentication
  it("should not detect jsonwebtoken or jose as authentication", () => {
    const manifests = [createManifest("package.json", "package.json", ["jsonwebtoken", "jose"])];
    const results = detectTechnologies(manifests, []);
    expect(results).toHaveLength(0);
  });

  // 11. Generic HTTP clients not producing External Integration
  it("should not detect generic HTTP clients as external integrations", () => {
    const manifests = [
      createManifest("package.json", "package.json", ["axios", "fetch", "node-fetch"]),
      createManifest("requirements.txt", "requirements.txt", ["requests", "httpx"]),
    ];
    const results = detectTechnologies(manifests, []);
    expect(results).toHaveLength(0);
  });

  // 12. LLM APIs producing External Integration, not AI/ML
  it("should detect OpenAI and Google Gemini as External Integrations, not AI / ML", () => {
    const manifests = [
      createManifest("package.json", "package.json", ["openai", "@google/generative-ai"]),
    ];
    const results = detectTechnologies(manifests, []);
    const openai = results.find((r) => r.technologyId === "openai");
    const gemini = results.find((r) => r.technologyId === "google-gemini");

    expect(openai).toBeDefined();
    expect(openai!.signals).toContain("External Integrations");
    expect(openai!.signals).not.toContain("AI / ML");

    expect(gemini).toBeDefined();
    expect(gemini!.signals).toContain("External Integrations");
    expect(gemini!.signals).not.toContain("AI / ML");
  });

  // 13. AI/ML frameworks producing AI/ML
  it("should detect LangChain as AI / ML", () => {
    const manifests = [createManifest("package.json", "package.json", ["langchain"])];
    const results = detectTechnologies(manifests, []);
    const langchain = results.find((r) => r.technologyId === "langchain");
    expect(langchain).toBeDefined();
    expect(langchain!.signals).toContain("AI / ML");
    expect(langchain!.signals).toHaveLength(1);
  });

  // 14. Duplicate aliases producing one result
  it("should deduplicate duplicate aliases in the same manifest file", () => {
    const manifests = [
      createManifest("package.json", "package.json", ["react", "react-dom", "react"]),
    ];
    const results = detectTechnologies(manifests, []);
    expect(results).toHaveLength(1);
    expect(results[0].technologyId).toBe("react");
    expect(results[0].evidence).toHaveLength(2); // react and react-dom (the duplicate react is ignored)
  });

  // 15. Detection being deterministic
  it("should return results sorted deterministically by canonical technologyId", () => {
    const manifests1 = [
      createManifest("package.json", "package.json", ["mongodb", "react", "next"]),
    ];
    const results1 = detectTechnologies(manifests1, []);

    const manifests2 = [
      createManifest("package.json", "package.json", ["next", "mongodb", "react"]),
    ];
    const results2 = detectTechnologies(manifests2, []);

    expect(results1).toEqual(results2);
    expect(results1.map((r) => r.technologyId)).toEqual(["mongodb", "nextjs", "react"]);
  });

  // Additional conformance tests for case-sensitive parsing behavior (from adjustment #2)
  it("should match dependencies case-sensitively conforming to actual manifest parsers", () => {
    // Django in registry is defined as "Django" and "django"
    const djangoResults = detectTechnologies([
      createManifest("requirements.txt", "requirements.txt", ["Django"]),
    ], []);
    expect(djangoResults.map((r) => r.technologyId)).toContain("django");

    const djangoLowerResults = detectTechnologies([
      createManifest("requirements.txt", "requirements.txt", ["django"]),
    ], []);
    expect(djangoLowerResults.map((r) => r.technologyId)).toContain("django");

    // FastAPI in registry is defined only as "fastapi"
    const fastapiLowerResults = detectTechnologies([
      createManifest("requirements.txt", "requirements.txt", ["fastapi"]),
    ], []);
    expect(fastapiLowerResults.map((r) => r.technologyId)).toContain("fastapi");

    // fastapi with wrong case should not match because it's case-sensitive
    const fastapiWrongCaseResults = detectTechnologies([
      createManifest("requirements.txt", "requirements.txt", ["FastAPI"]),
    ], []);
    expect(fastapiWrongCaseResults.map((r) => r.technologyId)).not.toContain("fastapi");
  });
});
