const router = require("express").Router();
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

// AUTH FUNCTIONS
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

// FORGOT AND RESET PASSWORDS
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:resetToken", authController.resetPassword);

/**
 * NOTE: SETTING PROTECT HERE PROTECTS EVERYTHING BELOW
 **/
router.use(authController.protect);

// USER UPDATE PASSWORD
router.patch("/updateMyPassword", authController.updatePassword);

// USER GET SELF INFORMATION
router.get("/me", userController.getMe, userController.getUser);

// USER SELF UPDATE ROUTES
router.patch("/updateMe", userController.uploadUserPhoto, userController.optimiseUserPhoto, userController.updateMe);
router.delete("/deleteMe", userController.deleteMe);

/**
 * NOTE: SETTING RESTRICT HERE RESTRICTS EVERYTHING BELOW
 * TO: ADMIN
 **/
router.use(authController.restrictTo("admin"));

router.route("/").get(userController.getAllUsers);
router.route("/:id").get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);

module.exports = router;
