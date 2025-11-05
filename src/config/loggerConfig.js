import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { LOG_LEVEL, NODE_ENV } from "./serverConfig.js";

const logLevel = LOG_LEVEL || (NODE_ENV === "development" ? "debug" : "info");
const isDev = NODE_ENV === "development";
const customFormat = winston.format.printf(
  ({ timestamp, level, message, stack, ...meta }) => {
    if (isDev) {
      return `${timestamp} ${level} : ${message}${stack ? `\n${stack}` : ""}`;
    }

    const logObject = {
      timestamp,
      level,
      message,
      ...(stack && { stack }),
      ...meta,
    };

    return JSON.stringify(logObject);
  }
);

// Base format shared by file logs (no colorize)
const baseFormat = winston.format.combine(
  winston.format.timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  customFormat
);

// Format for console (with colorize)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  customFormat
);

const logger = winston.createLogger({
  level: logLevel,
  format: baseFormat,

  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      format: consoleFormat,
    }),

    new DailyRotateFile({
      filename: "logs/%DATE%-combined.log",
      datePattern: "DD-MM-YYYY",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
      level: "info",
    }),

    new DailyRotateFile({
      filename: "logs/%DATE%-errors.log",
      datePattern: "DD-MM-YYYY",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d",
      level: "error",
    }),
  ],
});

export default logger;
