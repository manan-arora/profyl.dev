import { beforeEach, describe, expect, it, vi } from "vitest";
import { getProfylPageData } from "@/lib/services/profyl-page.service";
import { ensureProfileDataFresh } from "../freshness.service";
import { refreshPublicProfile } from "../public-profile-refresh.service";
import { ProfylPageData } from "@/types/profyl-page";

vi.mock("@/lib/services/profyl-page.service", () => ({
  getProfylPageData: vi.fn(),
}));

vi.mock("../freshness.service", () => ({
  ensureProfileDataFresh: vi.fn(),
}));

describe("refreshPublicProfile", () => {
  const profileData = { identity: { name: "Alex" } } as ProfylPageData;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getProfylPageData).mockResolvedValue(profileData);
  });

  it("shares one refresh operation for concurrent requests", async () => {
    let resolveFreshness: (() => void) | undefined;
    vi.mocked(ensureProfileDataFresh).mockReturnValue(
      new Promise<boolean>((resolve) => {
        resolveFreshness = () => resolve(true);
      }),
    );

    const firstRefresh = refreshPublicProfile("user_123");
    const secondRefresh = refreshPublicProfile("user_123");

    expect(firstRefresh).toBe(secondRefresh);
    expect(ensureProfileDataFresh).toHaveBeenCalledTimes(1);

    resolveFreshness?.();
    await expect(firstRefresh).resolves.toBe(profileData);
    expect(getProfylPageData).toHaveBeenCalledTimes(1);
  });

  it("removes failed operations so a later request can retry", async () => {
    vi.mocked(ensureProfileDataFresh)
      .mockRejectedValueOnce(new Error("refresh failed"))
      .mockResolvedValueOnce(true);

    await expect(refreshPublicProfile("user_123")).rejects.toThrow(
      "refresh failed",
    );
    await expect(refreshPublicProfile("user_123")).resolves.toBe(profileData);
    expect(ensureProfileDataFresh).toHaveBeenCalledTimes(2);
  });
});
