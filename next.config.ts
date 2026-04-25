import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/prices",
        destination: "/#sheet",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
