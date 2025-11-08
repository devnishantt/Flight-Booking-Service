import { Booking } from "../models/booking.js";
import BaseRepository from "./baseRepository.js";

export default class BookingRepository extends BaseRepository {
  constructor() {
    super(Booking);
  }

  async createBooking(data) {
    const response = await Booking.create(data);
    return response;
  }
}
