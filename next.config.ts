import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "uploadthing.com" },
      { protocol: "https", hostname: "utfs.io" },
    ],
  },
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
