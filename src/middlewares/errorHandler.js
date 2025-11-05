import logger from "../config/loggerConfig.js";
import { NODE_ENV } from "../config/serverConfig.js";
import { AppError } from "../utils/errors.js";
import { sendError } from "../utils/response.js";

const errorHandler = (err, req, res, next) => {
  let customErr = err;

  if (!(err instanceof AppError)) {
    customErr = new AppError(err.message || "Internal Server Error", 500);
  }

  const { message, statusCode, details, name, stack } = customErr;

  logger.error(`${name || "Error"}: ${message}`, {
    statusCode,
    details,
    stack,
  });

  const errDetails =
    NODE_ENV === "development" ? { name, stack, details } : undefined;

  return sendError(res, message, statusCode, errDetails);
};

export default errorHandler;
