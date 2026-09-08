import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Compress responses — reduces TTFB and transfer size
  compress: true,

  // Tree-shake lucide-react — it has 1000+ icons, only import what's used
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },

  images: {
    // Use modern AVIF/WebP formats automatically
    formats: ["image/avif", "image/webp"],
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
