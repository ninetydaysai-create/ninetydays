import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.2,       // 20% of transactions traced — adjust in production
  replaysSessionSampleRate: 0, // disable session replay (privacy)
  replaysOnErrorSampleRate: 1, // replay on errors only
  environment: process.env.NODE_ENV,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  beforeSend(event) {
    // Strip PII from breadcrumbs and request data
    if (event.request?.data) delete event.request.data;
    return event;
  },
});
