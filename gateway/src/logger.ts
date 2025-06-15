import winston from "winston";
import { LogstashTransport } from "winston-logstash-ts";

interface LogContext {
	service: string;
	requestId?: string;
	userId?: string;
	operation?: string;
	subgraph?: string;
	[key: string]: any;
}

let logstashLogger: winston.Logger | null = null;

if (
	process.env.NODE_ENV === "production" ||
	process.env.ENABLE_LOGSTASH === "true"
) {
	const host = process.env.LOGSTASH_HOST || "logstash";
	const port = parseInt(process.env.LOGSTASH_PORT || "5044");

	logstashLogger = LogstashTransport.createLogger("gateway", {
		host,
		port,
		level: process.env.LOG_LEVEL || "info",
		format: winston.format.combine(
			winston.format.timestamp(),
			winston.format.errors({ stack: true }),
			winston.format.json()
		),
		defaultMeta: {
			service: "gateway",
			environment: process.env.NODE_ENV || "development",
		},
		protocol: "tcp",
	});
}

const consoleLogger = winston.createLogger({
	level: process.env.LOG_LEVEL || "info",
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.errors({ stack: true }),
		winston.format.json()
	),
	defaultMeta: {
		service: "gateway",
		environment: process.env.NODE_ENV || "development",
	},
	transports: [
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.timestamp(),
				winston.format.colorize(),
				winston.format.printf((info: any) => {
					const { timestamp, level, message, service, ...meta } =
						info;
					const metaStr =
						Object.keys(meta).length > 0
							? JSON.stringify(meta)
							: "";
					return `${timestamp} [${
						service || "gateway"
					}] ${level}: ${message} ${metaStr}`;
				})
			),
		}),
	],
});

const logger = {
	log(level: string, message: string, meta: Record<string, any> = {}) {
		consoleLogger.log(level, message, meta);
		if (logstashLogger) {
			logstashLogger.log(level, message, meta);
		}
	},
	info(message: string, meta: Record<string, any> = {}) {
		this.log("info", message, meta);
	},
	error(message: string, meta: Record<string, any> = {}) {
		this.log("error", message, meta);
	},
	warn(message: string, meta: Record<string, any> = {}) {
		this.log("warn", message, meta);
	},
	debug(message: string, meta: Record<string, any> = {}) {
		this.log("debug", message, meta);
	},
	child(context: Partial<LogContext>) {
		return {
			info: (msg: string, meta: Record<string, any> = {}) =>
				logger.info(msg, { ...context, ...meta }),
			error: (msg: string, meta: Record<string, any> = {}) =>
				logger.error(msg, { ...context, ...meta }),
			warn: (msg: string, meta: Record<string, any> = {}) =>
				logger.warn(msg, { ...context, ...meta }),
			debug: (msg: string, meta: Record<string, any> = {}) =>
				logger.debug(msg, { ...context, ...meta }),
		};
	},
};

export const createContextLogger = (context: Partial<LogContext>) => {
	return logger.child(context);
};

export const generateRequestId = (): string => {
	return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

export const addRequestIdToLogger = (requestId: string) => {
	return createContextLogger({ requestId });
};

export default logger;
