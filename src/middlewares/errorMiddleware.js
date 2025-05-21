const AppError = require("../utils/AppError");

function sendErrorDev(req, res, err) {
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    return res.status(err.statusCode).render("error", {
      title: "Something went wrong",
      msg: err.message,
    });
  }
}

function sendErrorProd(req, res, err) {
  if (req.originalUrl.startsWith("/api")) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    console.error(err);
    return res.status(500).json({
      status: err.status,
      message: "Oops! Something went wrong.",
    });
  }

  if (err.isOperational) {
    return res.status(err.statusCode).render("error", {
      title: "Something went wrong",
      msg: err.message,
    });
  }

  console.log(err);
  return res.status(err.statusCode).render("error", {
    title: "Something went wrong",
    msg: "Please try again later",
  });
}

function handleCastErrorDB(err) {
  const message = `invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
}

function handleValidatorErrorDB(err) {
  const message = Object.values(err.errors)
    .map((el) => el.message)
    .join(". ");

  return new AppError(message, 400);
}

function handleDuplicateFieldsDB(err) {
  const value = Object.entries(err.errorResponse.keyValue).flat().join(": ");
  const message = `Duplicate field value for ${value}. Please use another value`;

  return new AppError(message, 400);
}

const handleJWTError = () => new AppError("Invalid token! Please log in again.", 401);

const handleJWTExpiredError = () => new AppError("Your token has expired! Please log in again.", 401);

module.exports = function (err, req, res, next) {
  const appENV = process.env.NODE_ENV;
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  
  if (appENV === "development") {
    sendErrorDev(req, res, err);
  } else if (appENV === "production") {
    let error = Object.create(err);

    if (err.name === "CastError") error = handleCastErrorDB(error);
    if (err.name === "ValidationError") error = handleValidatorErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === "JsonWebTokenError") error = handleJWTError();
    if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorProd(req, res, error);
  }
};
