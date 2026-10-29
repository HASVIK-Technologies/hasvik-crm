import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The floating dev badge sat on top of the sidebar and the phone tab bar. Errors are still shown in development.
  devIndicators: false,
  // The service worker must never be served from a stale cache, or app updates would not reach installed copies.
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_BASE_URL || "https://crm-backend-three-phi.vercel.app"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
