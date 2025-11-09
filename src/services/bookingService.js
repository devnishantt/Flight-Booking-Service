import axios from "axios";
import { randomBytes } from "crypto";
import { FLIGHT_URL } from "../config/serverConfig.js";
import { BookingStatus } from "../utils/enums.js";
import {
  ConflictError,
  InternalServerError,
  NotFoundError,
  ValidationError,
} from "../utils/errors.js";
import logger from "../config/loggerConfig.js";
import { Op } from "sequelize";

export default class BookingService {
  constructor(bookingRepository) {
    this.bookingRepository = bookingRepository;
  }

  generateBookingReference() {
    return `BK${randomBytes(6).toString("hex").toUpperCase()}`;
  }

  async createBooking(data) {
    console.log("laul: ", `${FLIGHT_URL}/api/v1/flight/${data.flightId}`);
    const flight = await axios.get(
      `${FLIGHT_URL}/api/v1/flight/${data.flightId}`
    );

    const { flightId, numberOfSeats } = data;
    const totalAmount = parseFloat(flight.data?.data?.price) * numberOfSeats;
    let bookingReference = this.generateBookingReference();
    let existingBooking = await this.bookingRepository.findOne({
      bookingReference,
    });

    while (existingBooking) {
      bookingReference = this.generateBookingReference;
      existingBooking = await this.bookingRepository.findOne({
        bookingReference,
      });
    }

    const bookingData = {
      flightId,
      numberOfSeats,
      totalAmount,
      bookingReference,
      status: BookingStatus.PENDING,
      seatNumbers: data.seatNumbers || null,
    };

    const booking = await this.bookingRepository.createBooking(bookingData);

    await axios.patch(
      `${FLIGHT_URL}/api/v1/flight/${flightId}/remaining-seats`,
      { amount: -numberOfSeats }
    );

    await this.bookingRepository.update(booking.id, {
      status: BookingStatus.CONFIRMED,
    });

    return await this.bookingRepository.findById(booking.id);
  }

  async getBooking(id) {
    return await this.bookingRepository.findById(id);
  }

  async getBookings(filters = {}) {
    const where = {};

    if (filters.flightId) {
      where.flightId = filters.flightId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.bookingReference) {
      where.bookingReference = filters.bookingReference;
    }

    return await this.bookingRepository.findAll({ where });
  }

  async makePayment(bookingId, paymentData) {
    const booking = await this.bookingRepository.findById(bookingId);

    if (booking.status === BookingStatus.CANCELLED) {
      throw new ValidationError(
        "Cannot process payment for a cancelled booking"
      );
    }

    if (booking.status === BookingStatus.COMPLETED) {
      throw new ConflictError(
        "Payment has already been processed for this booking"
      );
    }

    if (
      booking.status !== BookingStatus.PENDING &&
      booking.status !== BookingStatus.CONFIRMED
    ) {
      throw new ValidationError(
        `Cannot process payment for booking with status: ${booking.status}. Booking must be PENDING or CONFIRMED to process payment.`
      );
    }

    try {
      if (paymentData?.amount !== undefined) {
        const paymentAmount = Number(paymentData.amount);
        const bookingAmount = Number(booking.totalAmount);

        if (paymentAmount !== bookingAmount) {
          throw new ValidationError(
            `Payment amount (${paymentAmount}) does not match booking total (${bookingAmount})`
          );
        }
      }

      // Process payment (simulated)
      // In production, this would integrate with a payment gateway like Stripe, PayPal, etc.
      const paymentProcessed = true; // Simulated payment success

      if (!paymentProcessed) {
        throw new InternalServerError("Payment processing failed");
      }

      const updatedBooking = await this.bookingRepository.update(booking.id, {
        status: BookingStatus.COMPLETED,
      });

      return await this.bookingRepository.findById(booking.id);
    } catch (error) {
      if (error instanceof ValidationError || error instanceof ConflictError) {
        throw error;
      }
      throw new InternalServerError("Failed to process payment");
    }
  }

  async cancelBooking(bookingId) {
    const booking = await this.bookingRepository.findById(bookingId);

    if (booking.status === BookingStatus.CANCELLED) {
      throw new ConflictError("Cannot cancel a booking");
    }
    if (booking.status === BookingStatus.COMPLETED) {
      throw new ValidationError(
        "Cannot cancel a completed booking. Payment has already been processed."
      );
    }
    if (
      booking.status !== BookingStatus.PENDING &&
      booking.status !== BookingStatus.CONFIRMED
    ) {
      throw new ValidationError(
        `Cannot cancel booking with status: ${booking.status}. Only PENDING or CONFIRMED booking can be cancelled`
      );
    }

    try {
      await this.bookingRepository.update(booking.id, {
        status: BookingStatus.CANCELLED,
      });
      try {
        await axios.patch(
          `${FLIGHT_URL}/api/v1/flight/${booking.flightId}/remaining-seats`,
          { amount: booking.numberOfSeats }
        );
      } catch (error) {
        logger.error(
          `Failed to return seats for flight ${booking.flightId}: ${error.message}`
        );
      }

      return await this.bookingRepository.findById(booking.id);
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof ConflictError ||
        error instanceof NotFoundError
      ) {
        throw error;
      }

      throw new InternalServerError("Failed to cancel booking");
    }
  }

  async cancelOldBookings(hoursOld = 24) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - hoursOld);

      const oldBookings = await this.bookingRepository.findAll({
        where: {
          status: { [Op.in]: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
          createdAt: { [Op.lt]: cutoffDate },
        },
      });

      if (!oldBookings || oldBookings.length === 0) {
        return { cancelledCount: 0, bookings: [] };
      }

      const cancelledBookings = [];
      const errors = [];

      for (const booking of oldBookings) {
        try {
          // Update booking status to cancelled
          await this.bookingRepository.update(booking.id, {
            status: BookingStatus.CANCELLED,
          });

          // Return seats to the flight
          try {
            await axios.patch(
              `${FLIGHT_URL}/api/v1/flight/${booking.flightId}/remaining-seats`,
              { amount: booking.numberOfSeats }
            );
          } catch (error) {
            logger.error(
              `Failed to return seats for flight ${booking.flightId}: ${error.message}`
            );
            errors.push({
              bookingId: booking.id,
              error: "Failed to return seats to flight",
            });
          }

          const updatedBooking = await this.bookingRepository.findById(
            booking.id
          );
          cancelledBookings.push(updatedBooking);
        } catch (error) {
          logger.error(
            `Failed to cancel booking ${booking.id}: ${error.message}`
          );
          errors.push({
            bookingId: booking.id,
            error: error.message,
          });
        }
      }

      return {
        cancelledCount: cancelledBookings.length,
        bookings: cancelledBookings,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      throw new InternalServerError("Failed to cancel old bookings");
    }
  }
}
