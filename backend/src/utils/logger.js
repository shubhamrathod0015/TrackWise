import winston from "winston";
import { config } from "./config.js";

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack, service }) => {
    return `${timestamp} [${service || 'server'}] ${level}: ${stack || message}`;
});

const jsonFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
    const log = {
        timestamp,
        level,
        message: stack || message,
        ...metadata
    };
    return JSON.stringify(log);
});

const logger = winston.createLogger({
    level: config.logLevel || 'info',
    format: combine(
        errors({ stack: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
    ),
    defaultMeta: { service: 'server' },
    transports: [
        new winston.transports.Console({
            format: combine(
                colorize(),
                config.nodeEnv === 'production' ? jsonFormat : logFormat
            )
        }),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error', format: jsonFormat }),
        new winston.transports.File({ filename: 'logs/combined.log', format: jsonFormat })
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: 'logs/exceptions.log' })
    ],
    rejectionHandlers: [
        new winston.transports.File({ filename: 'logs/rejections.log' })
    ]
});

export const httpLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info({
            message: `${req.method} ${req.originalUrl}`,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('user-agent')
        });
    });
    next();
};

export default logger;
