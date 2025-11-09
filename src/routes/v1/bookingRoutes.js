import { Router } from "express";
import {
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
bookingRouter.post("/:id/payment", validateRequestBody(makePaymentSchema), makePayment)
bookingRouter.get("/:id", getBooking);
bookingRouter.get("/", getBookings);

export default bookingRouter;
