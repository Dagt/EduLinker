# Error monitoring with Sentry

EduLinker uses [Sentry](https://sentry.io/) to collect runtime errors and performance traces from the backend, web and mobile apps.

## Configuration

Set the appropriate DSN for each environment:

- **Backend**: `SENTRY_DSN` and optional `SENTRY_ENVIRONMENT` in your backend `.env` file.
- **Web**: `NEXT_PUBLIC_SENTRY_DSN` in `web/.env`.
- **Mobile**: `EXPO_PUBLIC_SENTRY_DSN` in `mobile/.env`.

Leave the value empty to disable reporting in local environments.

## Reviewing issues

1. Sign in to the Sentry dashboard for your organization.
2. Select the project (backend, web, or mobile).
3. Browse the *Issues* section to view recent errors. Each issue contains stack traces and context such as `request_id`, `school_id` and `user_id` when available.
4. Use the *Performance* section to explore traces and slow transactions.

For more details on Sentry features see the [official documentation](https://docs.sentry.io/).
