import { computeAnalytics } from "../analytics/analytics-engine";
import { loadAIContextSources, buildAIContext } from "./context-builder";
import { generateAIOutput } from "./generator";

async function main() {
  const userId = process.argv[2];
  if (!userId || userId.trim() === "") {
    console.error(
      "Error: Please provide a valid userId as the first command line argument."
    );
    console.error("Usage: npx tsx src/lib/ai/verify-run.ts <userId>");
    process.exit(1);
  }

  console.log(`[1/4] Computing analytics for user: ${userId}...`);
  const analyticsResult = await computeAnalytics(userId);
  console.log("-> Analytics computation complete.");

  console.log("[2/4] Loading context sources from DB...");
  const sources = await loadAIContextSources(userId, analyticsResult);
  console.log(
    `-> Loaded sources: profile=${!!sources.profile}, githubCache=${!!sources.githubCache}, leetcodeCache=${!!sources.leetcodeCache}, repositoriesCount=${sources.featuredRepositories.length}`
  );

  console.log("[3/4] Building normalized AIContext...");
  const context = buildAIContext(sources);
  console.log("-> AIContext compiled.");

  console.log("[4/4] Sending AIContext to Gemini API...");
  try {
    const start = Date.now();
    const insights = await generateAIOutput(context);
    const duration = ((Date.now() - start) / 1000).toFixed(2);

    console.log(
      `\n=================== GEMINI INSIGHTS GENERATION SUCCESS (${duration}s) ===================`
    );
    console.log(JSON.stringify(insights, null, 2));
    console.log(
      "================================================================================="
    );
  } catch (error: any) {
    console.error(
      "\n=================== GEMINI INSIGHTS GENERATION FAILED ==================="
    );
    console.error(error.message || error);
    if (error.stack) {
      console.error(error.stack);
    }
    console.error(
      "========================================================================="
    );
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Execution failed:", err);
  process.exit(1);
});
