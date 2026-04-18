import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://ninetydays.ai";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/score", "/p/"],
        disallow: ["/api/", "/dashboard", "/resume", "/gaps", "/roadmap",
          "/interview", "/mentor", "/linkedin", "/github", "/jobs",
          "/portfolio", "/settings", "/onboarding", "/admin"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
