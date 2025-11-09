import z from "zod";

export const createBookingSchema = z.object({
  flightId: z
    .number({ invalid_type_error: "Flight ID must be a number" })
    .int({ message: "Flight ID must be an integer" })
    .positive({ message: "Flight ID must be a positive number" }),
  numberOfSeats: z
    .number({ invalid_type_error: "Number of seats must be a number" })
    .int({ message: "Number of seats must be an integer" })
    .min(1, { message: "Number of seats must be at least 1" })
    .max(10, { message: "Number of seats must not exceed 10" }),
  seatNumbers: z
    .array(z.string(), { message: "Seat numbers must be an array of strings" })
    .optional(),
});

export const makePaymentSchema = z.object({
  amount: z
    .number({ invalid_type_error: "Payment amount must be a number" })
    .positive({ message: "Payment amount must be a positive number" })
    .optional(),
  paymentMethod: z
    .string()
    .min(2, { message: "Payment method must be at least 2 characters" })
    .max(50, { message: "Payment method must not exceed 50 characters" })
    .optional(),
  paymentReference: z
    .string()
    .min(5, { message: "Payment reference must be at least 5 characters" })
    .max(100, { message: "Payment reference must not exceed 100 characters" })
    .optional(),
});