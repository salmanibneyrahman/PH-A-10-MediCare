import dns from "node:dns";
// Local ISP route configuration node lock failure bypass kora
dns.setServers(["1.1.1.1", "8.8.8.8"]);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  // Better-auth adapter connectivity runtime standard optimization package map block bypass fix
  serverExternalPackages: ["@better-auth/mongo-adapter", "mongodb"],
};

export default nextConfig;
