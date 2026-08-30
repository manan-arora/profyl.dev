import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "@/components/ui/sonner";
import { ProfylPageData } from "@/types/profyl-page";
import { refreshPublicProfileData } from "./PublicProfileClient";

vi.mock("@/components/ui/sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("refreshPublicProfileData feedback", () => {
  const freshData = {} as ProfylPageData;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a top-center success toast after refresh completes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(freshData),
      }),
    );
    const onData = vi.fn();

    await expect(
      refreshPublicProfileData("alex", onData, vi.fn()),
    ).resolves.toBe(true);

    expect(onData).toHaveBeenCalledWith(freshData);
    expect(toast.success).toHaveBeenCalledWith("Profyl updated just now", {
      position: "top-center",
    });
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("shows a top-center error toast when refresh fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const onRetry = vi.fn();

    await expect(
      refreshPublicProfileData("alex", vi.fn(), onRetry),
    ).resolves.toBe(false);

    expect(toast.error).toHaveBeenCalledWith(
      "Profile data couldn’t update. The data may be outdated.",
      expect.objectContaining({
        position: "top-center",
        action: expect.objectContaining({
          label: "Try again",
          onClick: onRetry,
        }),
      }),
    );
    expect(toast.success).not.toHaveBeenCalled();
  });
});
