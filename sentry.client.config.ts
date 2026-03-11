import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // Capture 10% of sessions for performance — enough to spot slowdowns without noise
  tracesSampleRate: 0.1,

  // Only enable in production
  enabled: process.env.NODE_ENV === "production",
});
