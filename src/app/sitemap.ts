import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://profyl.dev";

  // Fetch only published users with a valid slug
  const publishedUsers = await prisma.user.findMany({
    where: {
      isPublished: true,
    },
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  const profileUrls: MetadataRoute.Sitemap = publishedUsers.map((user) => ({
    url: `${baseUrl}/${user.slug}`,
    lastModified: user.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    ...profileUrls,
  ];
}
