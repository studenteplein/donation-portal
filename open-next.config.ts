import type { OpenNextConfig } from "@opennextjs/cloudflare";

const config: OpenNextConfig = {
  platform: "cloudflare-workers",
  buildCommand: "npm run build",
};

export default config;