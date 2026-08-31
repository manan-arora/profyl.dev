import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard/",
        "/onboarding/",
        "/api/",
        "/sign-in/",
        "/sign-up/",
        "/redirect/",
        "/test-harness/",
        "/demo/",
      ],
    },
    sitemap: "https://profyl.dev/sitemap.xml",
  };
}
