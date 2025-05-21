const Tour = require("../models/tourModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

exports.getOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find();

  res.status(200).render("overview", {
    title: "All Tours",
    tours,
  });
});

exports.getTourDetails = catchAsync(async (req, res) => {
  const { slug } = req.params;
  const tour = await Tour.findOne({ slug }).populate({
    path: "reviews",
    select: "user rating review",
  });

  if (!tour) throw new AppError("There is no tour with that name", 404);

  res.status(200).render("tour", {
    title: tour.name,
    tour,
  });
});

exports.getLogin = catchAsync(async (req, res) => {
  res.status(200).render("login", {
    title: "Log into your account",
  });
});

exports.getAccount = catchAsync(async (req, res) => {
  res.status(200).render("account", {
    title: "Your account",
  });
});
