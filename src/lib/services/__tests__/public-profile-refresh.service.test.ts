import { beforeEach, describe, expect, it, vi } from "vitest";
import { getProfylPageData } from "@/lib/services/profyl-page.service";
import { scheduleBackgroundRevalidation } from "../freshness.service";
import { refreshPublicProfile } from "../public-profile-refresh.service";
import { ProfylPageData } from "@/types/profyl-page";

vi.mock("@/lib/services/profyl-page.service", () => ({
  getProfylPageData: vi.fn(),
}));

vi.mock("../freshness.service", () => ({
  scheduleBackgroundRevalidation: vi.fn(),
}));

describe("refreshPublicProfile", () => {
  const profileData = { identity: { name: "Alex" } } as ProfylPageData;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getProfylPageData).mockResolvedValue(profileData);
  });

  it("returns cached data immediately and schedules background revalidation", async () => {
    const result = await refreshPublicProfile("user_123");

    expect(result).toEqual({ data: profileData, refreshed: false });
    expect(getProfylPageData).toHaveBeenCalledWith({ userId: "user_123" });
    expect(scheduleBackgroundRevalidation).toHaveBeenCalledWith("user_123");
  });

  it("shares in-flight refresh operation for concurrent calls", async () => {
    const firstRefresh = refreshPublicProfile("user_123");
    const secondRefresh = refreshPublicProfile("user_123");

    expect(firstRefresh).toBe(secondRefresh);
    const result = await firstRefresh;
    expect(result).toEqual({ data: profileData, refreshed: false });
  });
});
