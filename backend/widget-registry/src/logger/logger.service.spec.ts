import { Test, TestingModule } from '@nestjs/testing';
import winston from 'winston';
import { LogstashTransport } from 'winston-logstash-ts';
import { LoggerService } from './logger.service';

jest.mock('winston', () => {
    const actual = jest.requireActual('winston');
    return {
        ...actual,
        createLogger: jest.fn(),
        transports: {
            Console: jest.fn(),
        },
        format: {
            combine: jest.fn(),
            timestamp: jest.fn(),
            errors: jest.fn(),
            json: jest.fn(),
            colorize: jest.fn(),
            printf: jest.fn(),
        },
    };
});

jest.mock('winston-logstash-ts', () => ({
    LogstashTransport: {
        createLogger: jest.fn(),
    },
}));

describe('LoggerService', () => {
    let service: LoggerService;

    const mockConsoleLogger = {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        verbose: jest.fn(),
    };

    const mockLogstashLogger = {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        verbose: jest.fn(),
    };

    beforeEach(async () => {
        jest.clearAllMocks();

        (winston.createLogger as jest.Mock).mockReturnValue(mockConsoleLogger);
        (LogstashTransport.createLogger as jest.Mock).mockReturnValue(
            mockLogstashLogger,
        );

        process.env.NODE_ENV = 'test';
        process.env.ENABLE_LOGSTASH = 'true';

        const module: TestingModule = await Test.createTestingModule({
            providers: [LoggerService],
        }).compile();

        service = module.get<LoggerService>(LoggerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('log methods', () => {
        it('calls consoleLogger.info and logstashLogger.info', () => {
            service.log('test log', { foo: 'bar' });
            expect(mockConsoleLogger.info).toHaveBeenCalledWith('test log', {
                foo: 'bar',
            });
            expect(mockLogstashLogger.info).toHaveBeenCalledWith('test log', {
                foo: 'bar',
            });
        });

        it('calls error on both loggers', () => {
            service.error('error message', { err: true });
            expect(mockConsoleLogger.error).toHaveBeenCalledWith(
                'error message',
                { err: true },
            );
            expect(mockLogstashLogger.error).toHaveBeenCalledWith(
                'error message',
                { err: true },
            );
        });

        it('calls warn on both loggers', () => {
            service.warn('warn message');
            expect(mockConsoleLogger.warn).toHaveBeenCalledWith(
                'warn message',
                {},
            );
            expect(mockLogstashLogger.warn).toHaveBeenCalledWith(
                'warn message',
                {},
            );
        });

        it('calls debug on both loggers', () => {
            service.debug('debug info');
            expect(mockConsoleLogger.debug).toHaveBeenCalledWith(
                'debug info',
                {},
            );
            expect(mockLogstashLogger.debug).toHaveBeenCalledWith(
                'debug info',
                {},
            );
        });

        it('calls verbose on both loggers', () => {
            service.verbose('verbose message');
            expect(mockConsoleLogger.verbose).toHaveBeenCalledWith(
                'verbose message',
                {},
            );
            expect(mockLogstashLogger.verbose).toHaveBeenCalledWith(
                'verbose message',
                {},
            );
        });
    });

    describe('child logger', () => {
        it('returns child logger with merged context', () => {
            const child = service.child({
                userId: 'abc123',
                requestId: 'req-1',
            });

            child.log('child log', { traceId: 'xyz' });

            expect(mockConsoleLogger.info).toHaveBeenCalledWith('child log', {
                userId: 'abc123',
                requestId: 'req-1',
                traceId: 'xyz',
            });

            expect(mockLogstashLogger.info).toHaveBeenCalledWith('child log', {
                userId: 'abc123',
                requestId: 'req-1',
                traceId: 'xyz',
            });
        });
    });
});
