import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";
import { prisma } from "@/lib/prisma";
import { refreshPublicProfile } from "@/lib/services/public-profile-refresh.service";
import { ProfylPageData } from "@/types/profyl-page";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/services/public-profile-refresh.service", () => ({
  refreshPublicProfile: vi.fn(),
}));

describe("public profile refresh route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("refreshes published profiles and returns canonical data", async () => {
    const data = { identity: { name: "Alex" } };
    const refreshResult = { data: data as ProfylPageData, refreshed: true };
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user_123",
      isPublished: true,
    } as any);
    vi.mocked(refreshPublicProfile).mockResolvedValue(refreshResult);

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ slug: "alex" }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(refreshResult);
    expect(refreshPublicProfile).toHaveBeenCalledWith("user_123");
  });

  it("does not refresh missing or unpublished profiles", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user_123",
      isPublished: false,
    } as any);

    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ slug: "private" }),
    });

    expect(response.status).toBe(404);
    expect(refreshPublicProfile).not.toHaveBeenCalled();
  });
});
