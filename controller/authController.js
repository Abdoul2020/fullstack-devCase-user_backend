const user = require("../db/models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// generate token function
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// signup controller

const signUp = catchAsync(async (req, res, next) => {
  const body = req.body;

  if (!["1", "2"].includes(body.userType)) {
    return next(new AppError("User type is not valid", 400));
  }

  const newUser = await user.create({
    userType: body.userType,
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    password: body.password,
    confirmPassword: body.confirmPassword,
  });

  if (!newUser) {
    return next(new AppError("User not created.Fail to create user", 400));
  }

  const result = newUser.toJSON();
  delete result.password;
  delete result.deletedAt;

  result.token = generateToken({
    id: result.id,
  });

  return res.status(201).json({
    status: "success",
    message: "User created successfully",
    data: result,
  });
});

// login controller

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // check if email and password are provided
  if (!email || !password) {
    return next(new AppError("Email and password are required", 400));
  }

  const result = await user.findOne({ where: { email } });

  if (!result || !(await bcrypt.compare(password, result.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  const token = generateToken({
    id: result.id,
  });

  return res.status(200).json({
    status: "success",
    message: "User logged in successfully",
    token,
  });
});

// authenticate token
const authenticateToken = catchAsync(async (req, res, next) => {
  let idtoken = "";
  // get the token from the header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    idtoken = req.headers.authorization.split(" ")[1];
  }
  if (!idtoken) {
    return next(new AppError("please login to get access", 401));
  }

  // verify the token
  const tokenDetails = jwt.verify(idtoken, process.env.JWT_SECRET);
  if (!tokenDetails) {
    return next(new AppError("Token is not valid", 400));
  }

  // get the user from the token
  const freshUser = await user.findByPk(tokenDetails.id);

  if (!freshUser) {
    return next(new AppError("User not found", 400));
  }
  req.user = freshUser;
  next();
});

const restrictTo = (...userTypes) => {
  const checkPermisson = (req, res, next) => {
    if (!userTypes.includes(req.user.userType)) {
      return next(
        new AppError(
          "You are not authorized to access this resource.No Permission",
          403
        )
      );
    }
    return next();
  };
  return checkPermisson;
};

module.exports = {
  signUp,
  login,
  authenticateToken,
  restrictTo,
};
