import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The floating dev badge sat on top of the sidebar and the phone tab bar. Errors are still shown in development.
  devIndicators: false,
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
