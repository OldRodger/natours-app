const multer = require("multer");
const sharp = require("sharp");

const User = require("../models/userModel");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    return cb(null, true);
  }
  cb(new AppError("Not an image! Please upload only images.", 400), true);
};

const upload = multer({
  storage: multerStorage,
  filter: multerFilter,
});

exports.uploadUserPhoto = upload.single("photo");
exports.optimiseUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer).resize(500, 500).toFormat("jpeg").jpeg({ quality: 90 }).toFile(`public/img/users/${req.file.filename}`);

  next();
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

function filterObj(obj, ...allowedFields) {
  const filtered = {};

  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) {
      filtered[key] = obj[key];
    }
  });

  return filtered;
}

exports.updateMe = catchAsync(async (req, res) => {
  if (req.body.password || req.body.passwordConfirm) throw new AppError("This route is not for password updates. Please use the '/updateMyPassword' route.", 400);

  const filteredBodyObject = filterObj(req.body, "name", "email");

  if (req.file) {
    filteredBodyObject.photo = req.file.filename;
  }

  const updatedUser = await User.findByIdAndUpdate(req.user, filteredBodyObject, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user, { active: false });

  res.status(200).json({
    status: "success",
    data: null,
  });
});

exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
