import { getProfylPageData } from "@/lib/services/profyl-page.service";
import { ensureProfileDataFresh } from "@/lib/services/freshness.service";
import { ProfylPageData } from "@/types/profyl-page";

const inFlightRefreshes = new Map<string, Promise<ProfylPageData>>();

/** Shares one freshness pipeline and read-model fetch per user in this process. */
export function refreshPublicProfile(userId: string): Promise<ProfylPageData> {
  const existingRefresh = inFlightRefreshes.get(userId);
  if (existingRefresh) {
    return existingRefresh;
  }

  const refresh = (async () => {
    await ensureProfileDataFresh(userId);

    const data = await getProfylPageData({ userId });
    if (!data) {
      throw new Error("Profile data unavailable");
    }

    return data;
  })();

  const trackedRefresh = refresh.then(
    (data) => {
      if (inFlightRefreshes.get(userId) === trackedRefresh) {
        inFlightRefreshes.delete(userId);
      }
      return data;
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
