import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleUserCreated } from "../userCreated";
import { handleUserUpdated } from "../userUpdated";
import { prisma } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";

vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

describe("Clerk Webhooks Handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("handleUserCreated", () => {
    const mockCreatedData = {
      id: "clerk_123",
      primary_email_address_id: "email_1",
      email_addresses: [{ id: "email_1", email_address: "test@example.com" }],
      external_accounts: [
        {
          provider: "oauth_github",
          provider_user_id: "gh_123",
          username: "gh_user",
        },
      ],
      first_name: "John",
      last_name: "Doe",
      image_url: "https://example.com/avatar.jpg",
    } as any;

    it("should create a fresh user when no existing user or collision exists", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue({} as any);

      await handleUserCreated(mockCreatedData);

      expect(prisma.user.create).toHaveBeenCalledTimes(1);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          clerkId: "clerk_123",
          email: "test@example.com",
          name: "John Doe",
          avatarUrl: "https://example.com/avatar.jpg",
          githubId: "gh_123",
          githubUsername: "gh_user",
          slug: "gh_user",
          profileStatus: "INCOMPLETE",
        },
      });
    });

    it("should update identity fields without overwriting slug when user already exists with matching clerkId", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user_db_1",
        clerkId: "clerk_123",
        slug: "custom_slug",
      } as any);
      vi.mocked(prisma.user.update).mockResolvedValue({} as any);

      await handleUserCreated(mockCreatedData);

      expect(prisma.user.update).toHaveBeenCalledTimes(1);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { clerkId: "clerk_123" },
        data: {
          email: "test@example.com",
          name: "John Doe",
          avatarUrl: "https://example.com/avatar.jpg",
          githubId: "gh_123",
          githubUsername: "gh_user",
        },
      });
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it("should delete orphaned DB record and create fresh user when Clerk API confirms 404 Not Found for oldClerkId", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.findFirst).mockResolvedValue({
        id: "old_user_db_id",
        clerkId: "old_clerk_999",
        email: "test@example.com",
      } as any);

      const mockGetUser = vi.fn().mockRejectedValue({ status: 404, message: "User not found" });
      vi.mocked(clerkClient).mockResolvedValue({
        users: { getUser: mockGetUser },
      } as any);

      vi.mocked(prisma.user.delete).mockResolvedValue({} as any);
      vi.mocked(prisma.user.create).mockResolvedValue({} as any);

      await handleUserCreated(mockCreatedData);

      expect(mockGetUser).toHaveBeenCalledWith("old_clerk_999");
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: "old_user_db_id" } });
      expect(prisma.user.create).toHaveBeenCalledTimes(1);
    });

    it("should throw error and NOT delete record when oldClerkId is still active in Clerk", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.findFirst).mockResolvedValue({
        id: "old_user_db_id",
        clerkId: "old_clerk_999",
        email: "test@example.com",
      } as any);

      const mockGetUser = vi.fn().mockResolvedValue({ id: "old_clerk_999" });
      vi.mocked(clerkClient).mockResolvedValue({
        users: { getUser: mockGetUser },
      } as any);

      await expect(handleUserCreated(mockCreatedData)).rejects.toThrow(
        /Conflict: Cannot create user clerk_123/
      );

      expect(prisma.user.delete).not.toHaveBeenCalled();
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it("should fail safely and NOT delete record when Clerk API returns a non-404 error (e.g. 500 or timeout)", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.findFirst).mockResolvedValue({
        id: "old_user_db_id",
        clerkId: "old_clerk_999",
        email: "test@example.com",
      } as any);

      const mockGetUser = vi.fn().mockRejectedValue({ status: 500, message: "Internal Server Error" });
      vi.mocked(clerkClient).mockResolvedValue({
        users: { getUser: mockGetUser },
      } as any);

      await expect(handleUserCreated(mockCreatedData)).rejects.toThrow(
        /Transient error verifying Clerk user old_clerk_999/
      );

      expect(prisma.user.delete).not.toHaveBeenCalled();
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe("handleUserUpdated", () => {
    it("should extract name and avatarUrl from Clerk payload and update User fields", async () => {
      const mockUpdatedData = {
        id: "clerk_123",
        primary_email_address_id: "email_1",
        email_addresses: [
          { id: "email_1", email_address: "updated@example.com" },
        ],
        external_accounts: [
          {
            provider: "oauth_github",
            provider_user_id: "gh_123",
            username: "gh_user_updated",
          },
        ],
        first_name: "Jane",
        last_name: "Smith",
        image_url: "https://example.com/avatar_updated.jpg",
      } as any;

      vi.mocked(prisma.user.updateMany).mockResolvedValue({} as any);

      await handleUserUpdated(mockUpdatedData);

      expect(prisma.user.updateMany).toHaveBeenCalledTimes(1);
      expect(prisma.user.updateMany).toHaveBeenCalledWith({
        where: { clerkId: "clerk_123" },
        data: {
          email: "updated@example.com",
          name: "Jane Smith",
          avatarUrl: "https://example.com/avatar_updated.jpg",
          githubUsername: "gh_user_updated",
        },
      });
    });

    it("should succeed and skip GitHub fields when no GitHub external account exists", async () => {
      const mockUpdatedData = {
        id: "clerk_123",
        primary_email_address_id: "email_1",
        email_addresses: [
          { id: "email_1", email_address: "updated@example.com" },
        ],
        external_accounts: [],
        first_name: "Jane",
        last_name: "Smith",
        image_url: "https://example.com/avatar_updated.jpg",
      } as any;

      vi.mocked(prisma.user.updateMany).mockResolvedValue({} as any);

      await handleUserUpdated(mockUpdatedData);

      expect(prisma.user.updateMany).toHaveBeenCalledTimes(1);
      expect(prisma.user.updateMany).toHaveBeenCalledWith({
        where: { clerkId: "clerk_123" },
        data: {
          email: "updated@example.com",
          name: "Jane Smith",
          avatarUrl: "https://example.com/avatar_updated.jpg",
        },
      });
    });
  });
});

