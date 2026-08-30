import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateAIOutput, GEMINI_RESPONSE_SCHEMA } from "../generator";
import { SYSTEM_PROMPT, PROMPT_VERSION } from "../prompts";
import { AIContext } from "../context-builder";

const mockGenerateContent = vi.fn();

vi.mock("@google/genai", () => {
  return {
    GoogleGenAI: class {
      models = {
        generateContent: mockGenerateContent,
      };
    },
  };
});

const mockContext: AIContext = {
  evaluation: {
    profylScore: 800,
    tier: "STRONG",
    radar: {
      buildActivity: 80,
      technicalRange: 75,
      problemSolving: 85,
      consistency: 90,
      openSource: 50,
    },
    signalBreakdown: { github: 80, projects: 75, leetcode: 85, consistency: 90 },
    components: {
      buildActivity: { score: 80, contributionScore: 85, activeProjectScore: 75 },
      technicalRange: { score: 75, signals: ["Frontend", "Backend"] },
      problemSolving: {
        score: 85,
        volumeScore: 90,
        difficultyScore: 80,
        contestScore: 85,
      },
      consistency: {
        score: 90,
        githubConsistency: 92,
        leetcodeConsistency: 88,
        githubActiveWeekScore: 95,
        githubGapScore: 90,
        leetcodeActiveDayScore: 85,
        leetcodeGapScore: 92,
      },
      openSource: {
        score: 50,
        contributionScore: 55,
        starsScore: 45,
        forksScore: 40,
        impactScore: 50,
      },
    },
  },
  github: { contributionsLastYear: 300 },
  leetcode: { problemsSolved: 150 },
  projects: [],
};

describe("generateAIOutput", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...ORIGINAL_ENV };
    process.env.GEMINI_API_KEY = "test-api-key";
    mockGenerateContent.mockReset();
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it("should throw an error if GEMINI_API_KEY is missing", async () => {
    delete process.env.GEMINI_API_KEY;
    await expect(generateAIOutput(mockContext)).rejects.toThrow(
      "Missing GEMINI_API_KEY"
    );
  });

  it("should generate insights successfully when Gemini returns a valid shape", async () => {
    const mockResponse = {
      aiSignal: "A recurring backend concentration.",
      aiSummary:
        "The developer's profile exhibits backend implementation patterns with relational storage focus.",
      aiEvidence: "Top 8% LeetCode percentile. 120 contributions.",
      strengthChips: ["Backend Systems", "Databases", "Problem Solving"],
      projectSummaries: [
        {
          repositoryId: "repo-123",
          summary: "An API client server with database connectivity.",
        },
      ],
    };

    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify(mockResponse),
    });

    const result = await generateAIOutput(mockContext);

    expect(result).toEqual(mockResponse);

    // Verify correct system prompt, contents, model and config parameters were sent
    expect(mockGenerateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gemini-2.5-flash",
        contents: expect.stringContaining("Generate the Profyl AI"),
        config: expect.objectContaining({
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseSchema: GEMINI_RESPONSE_SCHEMA,
        }),
      })
    );

    // Verify prompt version constant
    expect(PROMPT_VERSION).toBe("1.2.0");
  });

  it("should fail validation if Gemini returns an invalid shape (chip count too small)", async () => {
    // 2 chips (min is 3)
    const invalidResponse = {
      aiSignal: "Unremarkable signal.",
      aiSummary: "Short summary.",
      aiEvidence: "120 contributions.",
      strengthChips: ["Backend Systems", "Databases"],
      projectSummaries: [],
    };

    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify(invalidResponse),
    });

    await expect(generateAIOutput(mockContext)).rejects.toThrow();
  });

  it("should fail validation if Gemini returns an empty or invalid JSON response", async () => {
    mockGenerateContent.mockResolvedValue({
      text: "{ invalid json string }",
    });

    await expect(generateAIOutput(mockContext)).rejects.toThrow(
      "Failed to parse Gemini JSON response"
    );
  });
});
