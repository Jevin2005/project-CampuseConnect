import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Cloudflare R2 public CDN — product images & banners
        protocol: "https",
        hostname: "pub-4c2c15a46fc84483a25acc1371b0aa08.r2.dev",
        pathname: "/**",
      },
      {
        // Render backend static uploads (fallback / dev)
        protocol: "https",
        hostname: "project-campuseconnect.onrender.com",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
