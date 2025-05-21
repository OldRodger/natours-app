const crypto = require("node:crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const Email = require("../utils/Email");

function signJWT(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
}

function createSendToken(user, statusCode, res) {
  const token = signJWT(user._id);

  const cookieOption = {
    httpOnly: true,
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
  };
  if (process.env.NODE_ENV === "production") cookieOption.secure = true;
  res.cookie("jwt", token, cookieOption);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
}

exports.signup = catchAsync(async (req, res) => {
  const found = await User.findOne({ email: req.body.email });

  if (found) throw new AppError(`User with email '${req.body.email}' already exists`, 400);

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  await new Email(user, "http://127.0.0.1:8080/me").sendWelcome();
  await user.save();
  createSendToken(user, 201, res);

});

exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) throw new Error("Please provide email and password!");

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) throw new AppError("Incorrect email or password!", 401);

  createSendToken(user, 200, res);
});

exports.logout = catchAsync(async (req, res) => {
  res.cookie("jwt", "logged out", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ status: "success" });
});

exports.isLoggedin = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      const decoded = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);

      // CHECK IF USER STILL EXISTS
      const user = await User.findById(decoded.id);
      if (!user) return next();

      // CHECK IF USER CHANGED THEIR PASSWORD SINCE THEY LAST LOGGED IN
      if (user.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      res.locals.user = user;
    }
    next();
  } catch (error) {
    return next();
  }
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // CHECK IF THREE'S AN AUTHORIZATION HEADER TO BEGOIN WITH, AND IF IT STARTS WITH BARER
  if (req.headers?.authorization || req.headers?.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  // CHECK IF THERE IS ANY TOKEN AT ALL
  if (!token) throw new AppError("You are not logged in! Please log in to gain access");

  // DECODE TOKEN WITH VERIFY
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // CHECK IF USER STILL EXISTS
  const user = await User.findById(decoded.id);
  if (!user) throw new AppError("The user belonging to this token no longer exists!", 401);

  // CHECK IF USER CHANGED THEIR PASSWORD SINCE THEY LAST LOGGED IN
  if (user.changedPasswordAfter(decoded.iat)) {
    throw new AppError("User recently changed password! Please log in again");
  }

  req.user = user;
  res.locals.user = user;
  next();
});

exports.restrictTo = (...roles) =>
  catchAsync(async (req, res, next) => {
    if (!roles.includes(req.user.role)) throw new AppError("You do not have permission to perform this action", 403);
    next();
});

exports.forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  // 1. Find User by email and check if exists
  const user = await User.findOne({ email });

  if (!user) throw new AppError("There is no user with this email", 404);

  // 2. create reset token and exp time
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3. Send reset link to email
  const url = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;

  try {
    await new Email(user, url).sendPasswordReset();

    res.status(200).json({
      status: "success",
      message: "Password reset link has been sent to your email ",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExp = undefined;
    await user.save({ validateBeforeSave: false });

    throw new AppError("There was an error sending the email. Try again later!", 500);
  }
});

exports.resetPassword = catchAsync(async (req, res) => {
  const { resetToken } = req.params;
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExp: { $gt: Date.now() },
  }).select("+password");

  if (!user) throw new AppError("Token is either invalid or has expired", 400);

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExp = undefined;
  await user.save();

  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res) => {
  const { password, passwordConfirm, passwordCurrent } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.correctPassword(passwordCurrent, user.password))) {
    throw new AppError("Your current password is wrong", 401);
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  createSendToken(user, 200, res);
});
