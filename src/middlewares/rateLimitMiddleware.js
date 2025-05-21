const rateLimit = require("express-rate-limit");

module.exports = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this ip please try again in an hour",
});
