import nodeCron from "node-cron";
import logger from "../config/loggerConfig.js";
import { cronConfig } from "../config/serverConfig.js";
import { BookingRepository } from "../repositories/index.js";
import BookingService from "./bookingService.js";

const bookingService = new BookingService(new BookingRepository());

export const startCancelOldBookingsCron = () => {
  const { CRON_SCHEDULE, CANCEL_OLD_BOOKINGS_HOURS, TZ } = cronConfig;

  if (!nodeCron.validate(CRON_SCHEDULE)) {
    logger.error(
      `Invalid cron schedule: ${CRON_SCHEDULE}. Please check your CRON_SCHEDULE configuration`
    );

    return;
  }

  if (isNaN(CANCEL_OLD_BOOKINGS_HOURS) || CANCEL_OLD_BOOKINGS_HOURS <= 0) {
    logger.error(
      `Invalid CANCEL_OLD_BOOKINGS_HOURS: ${CANCEL_OLD_BOOKINGS_HOURS}. Must be a positive number`
    );
    return;
  }

  logger.info(
    `Scheduled cron job for canceling old bookings: ${CRON_SCHEDULE} (cancels bookings older than ${CANCEL_OLD_BOOKINGS_HOURS} hours)`
  );

  nodeCron.schedule(
    CRON_SCHEDULE,
    async () => {
      try {
        logger.info("Starting scheduled job: Cancel old bookings");
        const startTime = Date.now();

        const result = await bookingService.cancelOldBookings(
          CANCEL_OLD_BOOKINGS_HOURS
        );

        const duration = Date.now() - startTime;
        logger.info(
          `Completed scheduled job: Cancel old bookings. Cancelled ${result.cancelledCount} booking(s) in ${duration}ms`
        );

        if (result.errors && result.errors.length > 0) {
          logger.warn(
            `Some errors occurred during cancellation: ${JSON.stringify(
              result.errors
            )}`
          );
        }

        if (result.cancelledCount === 0) {
          logger.info("No old bookings found to cancel");
        }
      } catch (error) {
        logger.error(
          `Error in scheduled job (Cancel old bookings): ${error.message}`,
          {
            stack: error.stack,
          }
        );
      }
    },
    { scheduled: true, timezone: TZ }
  );

  logger.info("Cron job for canceling old bookings has been started");
};

export const initializeCronJobs = () => {
  const { CRON_ENABLED } = cronConfig;

  if (!CRON_ENABLED) {
    logger.error("Cron jobs are disabled. Set CRON_ENABLED=true to enable");
    return;
  }

  logger.info("Initializng cron jobs");
  startCancelOldBookingsCron();
  logger.info("All cron jobs initialized successfully");
};
