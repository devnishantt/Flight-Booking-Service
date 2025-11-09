import { Router } from "express";
import {
  cancelBooking,
  cancelOldBooking,
  createBooking,
  getBooking,
  getBookings,
  makePayment,
} from "../../controllers/bookingController.js";
import { validateRequestBody } from "../../validators/index.js";
import {
  createBookingSchema,
  makePaymentSchema,
} from "../../validators/bookingValidator.js";

const bookingRouter = Router();

bookingRouter.post(
  "/",
  validateRequestBody(createBookingSchema),
  createBooking
);
bookingRouter.post(
  "/:id/payment",
  validateRequestBody(makePaymentSchema),
  makePayment
);
bookingRouter.get("/:id", getBooking);
bookingRouter.get("/", getBookings);
bookingRouter.post("/cancel-old", cancelOldBooking);
bookingRouter.patch("/:id/cancel", cancelBooking);

export default bookingRouter;
