import { routes, type VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  framework: "nextjs",
  installCommand: "npm ci",
  buildCommand: "npm run build",
  headers: [
    // Deployments show fictional sample data; keep every deployment out of search engines.
    routes.header("/(.*)", [{ key: "X-Robots-Tag", value: "noindex, nofollow" }])
  ]
};
