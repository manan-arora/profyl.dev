import { getCurrentUser } from "@/lib/auth/current-user";
import { apiResponse } from "@/lib/http";
import { githubService } from "@/lib/services/github.service";

export async function POST() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return apiResponse({
                message: "Unauthorized",
                status: 401,
            });
        }

        const result = await githubService.syncGithub(user.id);

        return apiResponse({
            status: 200,
            message: "GitHub synchronization completed.",
            data: result,
        });
    } catch (error) {
        console.error("[POST /api/sync/github] Error during GitHub sync:", error);
        return apiResponse({
            message: "Internal server error",
            status: 500,
        });
    }
}
