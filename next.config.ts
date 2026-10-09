import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  typedRoutes: true,
  async redirects() {
    // The static prototype lives in public/prototype/. A redirect (not a rewrite) keeps the
    // browser URL inside /prototype/, so the pages' relative asset paths resolve correctly.
    return [
      { source: "/prototype", destination: "/prototype/index.html", permanent: false },
      { source: "/prototype/", destination: "/prototype/index.html", permanent: false }
    ];
  }
};

export default nextConfig;
