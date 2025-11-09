import { BookingRepository } from "../repositories/index.js";
import BookingService from "../services/bookingService.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";

const bookingService = new BookingService(new BookingRepository());

export const createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking(req.body);
  sendSuccess(res, booking, "Booking created successfully", 200);
});

export const getBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.getBooking(req.params.id);
  sendSuccess(res, booking, "Booking fetched successfully", 200);
});

export const getBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getBookings(req.query);
  sendSuccess(res, bookings, "Bookings fetched successfully", 200);
});

export const makePayment = asyncHandler(async (req, res) => {
  const booking = await bookingService.makePayment(req.params.id, req.body);
  sendSuccess(res, booking, "Payment processed successfully", 200);
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.cancelBooking(req.params.id);
  sendSuccess(res, booking, "Booking cancelled successfully", 200);
});

export const cancelOldBooking = asyncHandler(async (req, res) => {
  const hoursOld = req.query?.hoursOld || 24;
  const result = await bookingService.cancelOldBookings(hoursOld);
  sendSuccess(
    res,
    result,
    `${result.cancelledCount} old booking(s) cancelled successfully`,
    200
  );
});