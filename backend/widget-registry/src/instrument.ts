// Import with `const Sentry = require("@sentry/nestjs");` if you are using CJS
import * as Sentry from '@sentry/nestjs';

Sentry.init({
    dsn: 'https://165c9a6986df799b97b1857688918dfa@o4509503122374656.ingest.de.sentry.io/4509541637488720',

    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true,
});
