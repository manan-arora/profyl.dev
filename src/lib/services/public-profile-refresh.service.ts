import { getProfylPageData } from "@/lib/services/profyl-page.service";
import { ensureProfileDataFresh } from "@/lib/services/freshness.service";
import { ProfylPageData } from "@/types/profyl-page";

const inFlightRefreshes = new Map<string, Promise<{ data: ProfylPageData; refreshed: boolean }>>();

/** Shares one freshness pipeline and read-model fetch per user in this process. */
export function refreshPublicProfile(userId: string): Promise<{ data: ProfylPageData; refreshed: boolean }> {
  const existingRefresh = inFlightRefreshes.get(userId);
  if (existingRefresh) {
    return existingRefresh;
  }

  const refresh = (async () => {
    const refreshed = await ensureProfileDataFresh(userId);

    const data = await getProfylPageData({ userId });
    if (!data) {
      throw new Error("Profile data unavailable");
    }

    return { data, refreshed };
  })();

  const trackedRefresh = refresh.then(
    (result) => {
      if (inFlightRefreshes.get(userId) === trackedRefresh) {
        inFlightRefreshes.delete(userId);
      }
      return result;
    },
    (error) => {
      if (inFlightRefreshes.get(userId) === trackedRefresh) {
        inFlightRefreshes.delete(userId);
      }
      throw error;
    },
  );

  inFlightRefreshes.set(userId, trackedRefresh);
  return trackedRefresh;
}
