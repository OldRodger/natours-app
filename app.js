const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const express = require("express");
const morgan = require("morgan");
const path = require("node:path");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");

const AppError = require("./src/utils/AppError");
const tourRoutes = require("./src/routes/tourRoutes");
const userRoutes = require("./src/routes/userRoutes");
const viewRoutes = require("./src/routes/viewRoutes");
const reviewRoutes = require("./src/routes/reviewRoutes");
const errorMiddleware = require("./src/middlewares/errorMiddleware");
const rateLimitMiddleware = require("./src/middlewares/rateLimitMiddleware");

const app = express();
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "src", "views"));
app.set("view cache", false);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "script-src": [
          "'self'",
          "https://api.mapbox.com",
          "https://events.mapbox.com", // Mapbox analytics
          "https://cdnjs.cloudflare.com",
          "blob:",
        ],
        "style-src": [
          "'self'",
          "https://api.mapbox.com",
          "https://fonts.googleapis.com",
          "'unsafe-inline'", // For inline styles, if required by Mapbox GL CSS
        ],
        "img-src": [
          "'self'",
          "https://api.mapbox.com",
          "data:", // To allow base64 encoded images
        ],
        "worker-src": [
          "'self'",
          "blob:", // Allow blob URLs for web workers
        ],
        "connect-src": ["'self'", "https://api.mapbox.com", "https://events.mapbox.com", "ws://127.0.0.1:57387/"],
        "font-src": ["'self'", "https://api.mapbox.com", "https://fonts.gstatic.com"],
      },
    },
  })
);

// app.use(helmet());

app.use("/api", rateLimitMiddleware);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());
app.use(
  hpp({
    whitelist: ["duration", "price", "name", "difficulty", "ratingsAverage", "ratingsQuantity", "maxGroupSize"],
  })
);

app.use(express.static(path.join(__dirname, "public")));

app.use("/", viewRoutes);
app.use("/api/v1/tours", tourRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/reviews", reviewRoutes);

//404 ERROR MIDDLEWARE
app.use("*", function (req, res) {
  throw new AppError(`${req.method.toUpperCase()}: Can't find ${req.originalUrl} on this server!`, 404);
});

app.use(errorMiddleware);

module.exports = app;
