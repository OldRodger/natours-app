const { Router } = require("express");
const toursController = require("../controllers/tourController");
const authController = require("../controllers/authController");
const reviewRouter = require("./reviewRoutes");

const router = Router();

router.use("/:id/reviews", reviewRouter);

router.route("/tour-stats").get(toursController.getTourStats);
router.route("/tours-within/:distance/center/:coords/unit/:unit").get(toursController.getToursWithin);
router.route("/distance/:coords/unit/:unit").get(toursController.getTourDistance);
router.route("/monthly-plan/:year").get(toursController.getMonthlyPlan);
router.route("/top-5-cheap").get(toursController.aliasTopFive, toursController.getAllTours);

router.route("/").get(toursController.getAllTours).post(authController.protect, authController.restrictTo("lead-guide", "admin"), toursController.createTour);

router
  .route("/:id")
  .get(toursController.getTour)
  .patch(authController.protect, authController.restrictTo("lead-guide", "admin"), toursController.uploadTourPhotos, toursController.optimiseTourPhotos, toursController.updateTour)
  .delete(authController.protect, authController.restrictTo("lead-guide", "admin"), toursController.deleteTour);

module.exports = router;
