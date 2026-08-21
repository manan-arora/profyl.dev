import { NextResponse } from "next/server";
import { analyzeRepository } from "@/lib/repository-analysis/orchestration";
import { detectTechnologies } from "@/lib/repository-analysis/technologies/technology-detector";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { owner, repo, branch = "main" } = body;

    if (!owner || !repo) {
      return NextResponse.json(
        { error: "Missing required parameters: owner and repo are required." },
        { status: 400 }
      );
    }

    // Access token is read exclusively from server-side environment variables
    const accessToken = process.env.GITHUB_TEST_TOKEN || process.env.GITHUB_ACCESS_TOKEN || "";

    const analysisResult = await analyzeRepository({
      repositoryId: `harness-${owner}-${repo}`,
      owner,
      repo,
      accessToken,
      branch,
    });

    const technologies = detectTechnologies(
      analysisResult.parsedManifests,
      analysisResult.artifacts
    );

    return NextResponse.json({
      repositoryId: analysisResult.repositoryId,
      owner,
      repo,
      branch,
      parsedManifests: analysisResult.parsedManifests,
      artifacts: analysisResult.artifacts,
      technologies,
    });
  } catch (error: any) {
    console.error("Test harness analysis failed:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during repository analysis." },
      { status: 500 }
    );
  }
}
