import { routes, type VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  framework: "nextjs",
  installCommand: "npm ci",
  buildCommand: "npm run build",
  redirects: [
    // Until the React app has real pages, the deployment root opens the static prototype,
    // so a bare preview URL is enough to share with session participants.
    { source: "/", destination: "/prototype/index.html", permanent: false }
  ],
  headers: [
    // The prototype shows fictional sample data; keep every deployment out of search engines.
    routes.header("/(.*)", [{ key: "X-Robots-Tag", value: "noindex, nofollow" }])
  ]
};
