# Monitoring and Error Tracking

EduLinker uses [Sentry](https://sentry.io) to collect errors and performance traces for the backend, web, and mobile applications.

## Backend
- Configure the `SENTRY_DSN` and `SENTRY_ENVIRONMENT` variables in your backend environment.
- Logs are structured as JSON and include `request_id`, `school_id`, and `user_id` fields.
- Visit the Sentry project for the backend to review error events and trace slow requests.

## Web (Next.js)
- Set `NEXT_PUBLIC_SENTRY_DSN` in `web/.env`.
- Errors and traces from the browser are sent to the Sentry project corresponding to the configured environment.

## Mobile (Expo)
- Set `EXPO_PUBLIC_SENTRY_DSN` in `mobile/.env`.
- The app reports crashes and performance data through the `sentry-expo` SDK.

## Reviewing Errors and Traces
1. Log in to the Sentry dashboard for your organization.
2. Choose the appropriate project (backend, web, or mobile).
3. Use the Issues section to review grouped errors and assign them for resolution.
4. Explore the Performance section to analyze traces and identify slow transactions.
