import { describe, it, expect } from "vitest";
import { calculateTechnicalRange } from "../range-scorer";
import { DetectedTechnology } from "../../repository-analysis/technologies/technology-types";

describe("calculateTechnicalRange", () => {
  const createTech = (id: string, name: string, signals: string[]): DetectedTechnology => ({
    technologyId: id,
    name,
    signals,
    evidence: [],
  });

  it("should return 0 score and empty signals when no technologies are detected", () => {
    const result = calculateTechnicalRange([]);
    expect(result).toEqual({
      score: 0,
      signals: [],
    });
  });

  it("should calculate correct score for individual signals", () => {
    expect(calculateTechnicalRange([createTech("react", "React", ["Frontend"])]).score).toBe(5);
    expect(calculateTechnicalRange([createTech("express", "Express", ["Backend"])]).score).toBe(10);
    expect(calculateTechnicalRange([createTech("postgres", "PostgreSQL", ["Database"])]).score).toBe(12);
    expect(calculateTechnicalRange([createTech("auth0", "Auth0", ["Authentication"])]).score).toBe(8);
    expect(calculateTechnicalRange([createTech("stripe", "Stripe", ["External Integrations"])]).score).toBe(10);
    expect(calculateTechnicalRange([createTech("langchain", "LangChain", ["AI / ML"])]).score).toBe(15);
    expect(calculateTechnicalRange([createTech("docker", "Docker", ["Infrastructure"])]).score).toBe(10);
    expect(calculateTechnicalRange([createTech("redis", "Redis", ["Caching"])]).score).toBe(8);
    expect(calculateTechnicalRange([createTech("bullmq", "BullMQ", ["Background Jobs"])]).score).toBe(11);
    expect(calculateTechnicalRange([createTech("socketio", "Socket.IO", ["Real-time"])]).score).toBe(11);
  });

  it("should sum weights for multiple signals", () => {
    const result = calculateTechnicalRange([
      createTech("react", "React", ["Frontend"]),
      createTech("postgres", "PostgreSQL", ["Database"]),
      createTech("docker", "Docker", ["Infrastructure"]),
    ]);
    expect(result.score).toBe(5 + 12 + 10); // 27
    expect(result.signals).toContain("Frontend");
    expect(result.signals).toContain("Database");
    expect(result.signals).toContain("Infrastructure");
    expect(result.signals).toHaveLength(3);
  });

  it("should deduplicate signals across multiple technologies and count them only once", () => {
    const result = calculateTechnicalRange([
      createTech("react", "React", ["Frontend"]),
      createTech("vue", "Vue", ["Frontend"]),
      createTech("express", "Express", ["Backend"]),
      createTech("nestjs", "NestJS", ["Backend"]),
    ]);
    expect(result.score).toBe(5 + 10); // 15
    expect(result.signals).toContain("Frontend");
    expect(result.signals).toContain("Backend");
    expect(result.signals).toHaveLength(2);
  });

  it("should handle representative full-stack projects correctly", () => {
    // Next.js (Frontend, Backend) + Prisma (Database) + Redis (Caching) + Docker (Infrastructure)
    const result = calculateTechnicalRange([
      createTech("nextjs", "Next.js", ["Frontend", "Backend"]),
      createTech("prisma", "Prisma", ["Database"]),
      createTech("redis", "Redis", ["Caching"]),
      createTech("docker", "Docker", ["Infrastructure"]),
    ]);
    expect(result.score).toBe(5 + 10 + 12 + 8 + 10); // 45
    expect(result.signals).toContain("Frontend");
    expect(result.signals).toContain("Backend");
    expect(result.signals).toContain("Database");
    expect(result.signals).toContain("Caching");
    expect(result.signals).toContain("Infrastructure");
    expect(result.signals).toHaveLength(5);
  });

  it("should return the maximum possible score when all known signals are present", () => {
    const result = calculateTechnicalRange([
      createTech("t1", "T1", ["Frontend"]),
      createTech("t2", "T2", ["Backend"]),
      createTech("t3", "T3", ["Database"]),
      createTech("t4", "T4", ["Authentication"]),
      createTech("t5", "T5", ["External Integrations"]),
      createTech("t6", "T6", ["AI / ML"]),
      createTech("t7", "T7", ["Infrastructure"]),
      createTech("t8", "T8", ["Caching"]),
      createTech("t9", "T9", ["Background Jobs"]),
      createTech("t10", "T10", ["Real-time"]),
    ]);
    // Max score = 5 + 10 + 12 + 8 + 10 + 15 + 10 + 8 + 11 + 11 = 100
    expect(result.score).toBe(100);
    expect(result.signals).toHaveLength(10);
  });

  it("should ignore unknown signals gracefully without failing", () => {
    const result = calculateTechnicalRange([
      createTech("t1", "T1", ["Frontend"]),
      createTech("t2", "T2", ["Unknown Signal"]),
    ]);
    expect(result.score).toBe(5);
    expect(result.signals).toContain("Frontend");
    expect(result.signals).toContain("Unknown Signal");
    expect(result.signals).toHaveLength(2);
  });
});
