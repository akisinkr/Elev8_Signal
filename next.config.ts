import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "*.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "logo.clearbit.com",
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  org: "elev8-ay",
  project: "javascript-nextjs",

  // Suppress Sentry CLI output during builds
  silent: true,

  // Don't upload source maps (keeps build fast, avoids needing SENTRY_AUTH_TOKEN)
  sourcemaps: { disable: true },

  // Don't auto-instrument — we control what gets tracked
  autoInstrumentServerFunctions: false,
});
