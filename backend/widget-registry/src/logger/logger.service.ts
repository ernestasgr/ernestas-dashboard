import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import winston from 'winston';
import { LogstashTransport } from 'winston-logstash-ts';

interface LogContext {
    service: string;
    requestId?: string;
    userId?: string;
    operation?: string;
    subgraph?: string;
    [key: string]: any;
}

@Injectable()
export class LoggerService implements NestLoggerService {
    private consoleLogger: winston.Logger;
    private logstashLogger: winston.Logger | null = null;
    private defaultMeta = {
        service: 'widget-registry',
        environment: process.env.NODE_ENV || 'development',
    };

    constructor() {
        this.consoleLogger = winston.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json(),
            ),
            defaultMeta: this.defaultMeta,
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.colorize(),
                        winston.format.printf((info: any) => {
                            const {
                                timestamp,
                                level,
                                message,
                                service,
                                ...meta
                            } = info;
                            const metaStr =
                                Object.keys(meta).length > 0
                                    ? JSON.stringify(meta)
                                    : '';
                            return `${timestamp} [${service || 'widget-registry'}] ${level}: ${message} ${metaStr}`;
                        }),
                    ),
                }),
            ],
        });

        if (
            process.env.NODE_ENV === 'production' ||
            process.env.ENABLE_LOGSTASH === 'true'
        ) {
            const host = process.env.LOGSTASH_HOST || 'logstash';
            const port = parseInt(process.env.LOGSTASH_PORT || '5044');

            this.logstashLogger = LogstashTransport.createLogger(
                'widget-registry',
                {
                    host,
                    port,
                    level: process.env.LOG_LEVEL || 'info',
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.errors({ stack: true }),
                        winston.format.json(),
                    ),
                    defaultMeta: this.defaultMeta,
                    protocol: 'tcp',
                },
            );
        }
    }

    log(message: string, meta: Record<string, any> = {}) {
        this.consoleLogger.info(message, meta);
        this.logstashLogger?.info(message, meta);
    }

    error(message: string, meta: Record<string, any> = {}) {
        this.consoleLogger.error(message, meta);
        this.logstashLogger?.error(message, meta);
    }

    warn(message: string, meta: Record<string, any> = {}) {
        this.consoleLogger.warn(message, meta);
        this.logstashLogger?.warn(message, meta);
    }

    debug(message: string, meta: Record<string, any> = {}) {
        this.consoleLogger.debug(message, meta);
        this.logstashLogger?.debug(message, meta);
    }

    verbose(message: string, meta: Record<string, any> = {}) {
        this.consoleLogger.verbose(message, meta);
        this.logstashLogger?.verbose(message, meta);
    }

    child(context: Partial<LogContext>) {
        return {
            log: (msg: string, meta: Record<string, any> = {}) =>
                this.log(msg, { ...context, ...meta }),
            error: (msg: string, meta: Record<string, any> = {}) =>
                this.error(msg, { ...context, ...meta }),
            warn: (msg: string, meta: Record<string, any> = {}) =>
                this.warn(msg, { ...context, ...meta }),
            debug: (msg: string, meta: Record<string, any> = {}) =>
                this.debug(msg, { ...context, ...meta }),
            verbose: (msg: string, meta: Record<string, any> = {}) =>
                this.verbose(msg, { ...context, ...meta }),
        };
    }
}
