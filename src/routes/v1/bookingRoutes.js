import { Router } from "express";
import {
  createBooking,
  getBooking,
  getBookings,
} from "../../controllers/bookingController.js";

const bookingRouter = Router();

bookingRouter.post("/", createBooking);
bookingRouter.get("/:id", getBooking);
bookingRouter.get("/", getBookings);

export default bookingRouter;
