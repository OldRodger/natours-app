const router = require("express").Router();
const viewController = require("../controllers/viewController.js");
const authController = require("../controllers/authController.js");

router.get("/", authController.isLoggedin, viewController.getOverview);
router.get("/tour/:slug", authController.isLoggedin, viewController.getTourDetails);
router.get("/login", authController.isLoggedin, viewController.getLogin);
router.get("/me", authController.protect, viewController.getAccount);

module.exports = router;
