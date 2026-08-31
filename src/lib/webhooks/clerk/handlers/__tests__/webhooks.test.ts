import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleUserCreated } from "../userCreated";
import { handleUserUpdated } from "../userUpdated";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      upsert: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

describe("Clerk Webhooks Handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("handleUserCreated", () => {
    it("should extract name and avatarUrl from Clerk payload and upsert User", async () => {
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

      vi.mocked(prisma.user.upsert).mockResolvedValue({} as any);

      await handleUserCreated(mockCreatedData);

      expect(prisma.user.upsert).toHaveBeenCalledTimes(1);
      expect(prisma.user.upsert).toHaveBeenCalledWith({
        where: { clerkId: "clerk_123" },
        create: {
          clerkId: "clerk_123",
          email: "test@example.com",
          name: "John Doe",
          avatarUrl: "https://example.com/avatar.jpg",
          githubId: "gh_123",
          githubUsername: "gh_user",
          slug: "gh_user",
          profileStatus: "INCOMPLETE",
        },
        update: {
          email: "test@example.com",
          name: "John Doe",
          avatarUrl: "https://example.com/avatar.jpg",
          githubId: "gh_123",
          githubUsername: "gh_user",
          slug: "gh_user",
        },
      });
    });

    it("should handle empty first_name or last_name gracefully", async () => {
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
        first_name: null,
        last_name: "Doe",
        image_url: null,
      } as any;

      vi.mocked(prisma.user.upsert).mockResolvedValue({} as any);

      await handleUserCreated(mockCreatedData);

      expect(prisma.user.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            name: "Doe",
            avatarUrl: null,
          }),
        }),
      );
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
        external_accounts: [
          // No GitHub OAuth account
        ],
        first_name: "Jane",
        last_name: "Smith",
        image_url: "https://example.com/avatar_updated.jpg",
      } as any;

      vi.mocked(prisma.user.updateMany).mockResolvedValue({} as any);

      // Should NOT throw an error
      await handleUserUpdated(mockUpdatedData);

      expect(prisma.user.updateMany).toHaveBeenCalledTimes(1);
      // Should update email, name, avatarUrl but NOT githubUsername
      expect(prisma.user.updateMany).toHaveBeenCalledWith({
        where: { clerkId: "clerk_123" },
        data: {
          email: "updated@example.com",
          name: "Jane Smith",
          avatarUrl: "https://example.com/avatar_updated.jpg",
        },
      });
    });

    it("should update GitHub fields when GitHub account exists again after disconnection", async () => {
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
            username: "gh_user_reconnected",
          },
        ],
        first_name: "Jane",
        last_name: "Smith",
        image_url: "https://example.com/avatar_updated.jpg",
      } as any;

      vi.mocked(prisma.user.updateMany).mockResolvedValue({} as any);

      await handleUserUpdated(mockUpdatedData);

      expect(prisma.user.updateMany).toHaveBeenCalledTimes(1);
      // Should include githubUsername when account exists
      expect(prisma.user.updateMany).toHaveBeenCalledWith({
        where: { clerkId: "clerk_123" },
        data: {
          email: "updated@example.com",
          name: "Jane Smith",
          avatarUrl: "https://example.com/avatar_updated.jpg",
          githubUsername: "gh_user_reconnected",
        },
      });
    });
  });
});
