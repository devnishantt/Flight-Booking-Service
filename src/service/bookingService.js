import axios from "axios";
import { randomBytes } from "crypto";
import { FLIGHT_URL } from "../config/serverConfig.js";
import { BookingStatus } from "../utils/enums.js";
import {
  ConflictError,
  InternalServerError,
  ValidationError,
} from "../utils/errors.js";

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
}
