import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Course material uploads are up to 20 MB (backend MAX_UPLOAD_MB); both the proxy and Server
// Actions buffer request bodies with lower defaults (10 MB and 1 MB).
const UPLOAD_LIMIT = "21mb";

const nextConfig: NextConfig = {
  agentRules: false,
  typedRoutes: true,
  experimental: {
    serverActions: { bodySizeLimit: UPLOAD_LIMIT },
    proxyClientMaxBodySize: UPLOAD_LIMIT
  },
  async redirects() {
    return [
      // Invitation links shared before the routes were English (003 FR-005).
      { source: "/unirse/:code", destination: "/join/:code", permanent: true }
    ];
  }
};

export default createNextIntlPlugin("./src/i18n/request.ts")(nextConfig);
