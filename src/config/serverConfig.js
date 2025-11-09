import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT || 3000;
export const NODE_ENV = process.env.NODE_ENV || "development";
export const LOG_LEVEL = process.env.LOG_LEVEL;
export const FLIGHT_URL = process.env.FLIGHT_URL;

export const dbConfig = {
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_USER: process.env.DB_USER || "root",
  DB_PASSWORD: process.env.DB_PASSWORD || "root",
  DB_NAME: process.env.DB_NAME || "test_db",
};

export const cronConfig = {
  CRON_ENABLED:
    process.env.CRON_ENABLED === "true" ||
    process.env.NODE_ENV === "production",
  CRON_SCHEDULE: process.env.CRON_SCHEDULE || "0 2 * * *",
  CANCEL_OLD_BOOKINGS_HOURS:
    parseInt(process.env.CANCEL_OLD_BOOKINGS_HOURS) || 24,
  TZ: process.env.TS || "UTC",
};
