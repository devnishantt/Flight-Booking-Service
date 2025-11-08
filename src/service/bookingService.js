import axios from "axios";
import { randomBytes } from "crypto";
import { FLIGHT_URL } from "../config/serverConfig.js";
import { BookingStatus } from "../utils/enums.js";

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
}
