import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
