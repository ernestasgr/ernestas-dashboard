// Import with `import * as Sentry from "@sentry/node"` if you are using ESM
import * as Sentry from "@sentry/node";

Sentry.init({
	dsn: "https://94b4da31f1b1bffe466adeeb8e095fe4@o4509503122374656.ingest.de.sentry.io/4509503227232336",

	// Setting this option to true will send default PII data to Sentry.
	// For example, automatic IP address collection on events
	sendDefaultPii: true,
});
