const { Sequelize } = require("sequelize");
const user = require("../db/models/user");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const bcrypt = require("bcrypt");

// Get all users (except admin)
const getAllUser = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, search } = req.query;
  const offset = (page - 1) * limit;

  let whereClause = {
    userType: {
      [Sequelize.Op.ne]: "0",
    },
  };

  // Add search functionality
  if (search) {
    whereClause[Sequelize.Op.or] = [
      { firstName: { [Sequelize.Op.iLike]: `%${search}%` } },
      { lastName: { [Sequelize.Op.iLike]: `%${search}%` } },
      { email: { [Sequelize.Op.iLike]: `%${search}%` } },
    ];
  }

  const users = await user.findAndCountAll({
    where: whereClause,
    attributes: { exclude: ["password"] },
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [["createdAt", "DESC"]],
  });

  return res.status(200).json({
    status: "success",
    data: {
      users: users.rows,
      totalCount: users.count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(users.count / limit),
    },
  });
});

// Get user by ID
const getUserById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const foundUser = await user.findByPk(id, {
    attributes: { exclude: ["password", "deletedAt"] },
  });

  if (!foundUser) {
    return next(new AppError("User not found.Invalid user id", 404));
  }

  // Check if trying to access admin user (userType '0')
  if (foundUser.userType === "0") {
    return next(
      new AppError("Access denied, Only admin can access this resource", 403)
    );
  }

  return res.status(200).json({
    status: "success",
    data: foundUser,
  });
});

// Create new user
const createUser = catchAsync(async (req, res, next) => {
  const { userType, firstName, lastName, email, password, confirmPassword } =
    req.body;

  // Check if user already exists
  const existingUser = await user.findOne({ where: { email } });
  if (existingUser) {
    return next(new AppError("User with this email already exists", 400));
  }

  // Create new user
  const newUser = await user.create({
    userType,
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
  });

  if (!newUser) {
    return next(new AppError("Failed to create user", 400));
  }

  const result = newUser.toJSON();
  delete result.password;
  delete result.deletedAt;

  return res.status(201).json({
    status: "success",
    message: "User created successfully",
    data: result,
  });
});

// Update user
const updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  // Find the user
  const foundUser = await user.findByPk(id);
  if (!foundUser) {
    return next(new AppError("User not found", 404));
  }

  // Check if trying to update admin user (userType '0')
  if (foundUser.userType === "0") {
    return next(new AppError("Cannot update admin user", 403));
  }

  // Check if email is being updated and if it already exists
  if (updateData.email && updateData.email !== foundUser.email) {
    const existingUser = await user.findOne({
      where: {
        email: updateData.email,
        id: { [Sequelize.Op.ne]: id },
      },
    });
    if (existingUser) {
      return next(new AppError("User with this email already exists", 400));
    }
  }

  // Handle password update
  if (updateData.password && updateData.confirmPassword) {
    if (updateData.password !== updateData.confirmPassword) {
      return next(
        new AppError("Password and confirm password do not match", 400)
      );
    }
    // Hash the new password
    updateData.password = await bcrypt.hash(updateData.password, 10);
    delete updateData.confirmPassword;
  } else if (updateData.password && !updateData.confirmPassword) {
    return next(
      new AppError("Confirm password is required when updating password", 400)
    );
  }

  // Update the user
  await foundUser.update(updateData);

  // Get updated user without password
  const updatedUser = await user.findByPk(id, {
    attributes: { exclude: ["password"] },
  });

  return res.status(200).json({
    status: "success",
    message: "User updated successfully",
    data: updatedUser,
  });
});

// Delete user (soft delete)
const deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const foundUser = await user.findByPk(id);
  if (!foundUser) {
    return next(new AppError("User not found, Invalid user id", 404));
  }

  // Check if trying to delete admin user (userType '0')
  if (foundUser.userType === "0") {
    return next(new AppError("Cannot delete admin user", 403));
  }

  // Soft delete the user
  await foundUser.destroy();

  return res.status(200).json({
    status: "success",
    message: "User deleted successfully",
  });
});

// Get current user profile
const getCurrentUser = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const currentUser = await user.findByPk(userId, {
    attributes: { exclude: ["password", "deletedAt"] },
  });

  return res.status(200).json({
    status: "success",
    data: currentUser,
  });
});

// Update current user profile
const updateCurrentUser = catchAsync(async (req, res, next) => {
  const updateData = req.body;
  const currentUser = req.user;

  // Prevent updating userType for current user
  if (updateData.userType) {
    delete updateData.userType;
  }

  // Check if email is being updated and if it already exists
  if (updateData.email && updateData.email !== currentUser.email) {
    const existingUser = await user.findOne({
      where: {
        email: updateData.email,
        id: { [Sequelize.Op.ne]: currentUser.id },
      },
    });
    if (existingUser) {
      return next(new AppError("User with this email already exists", 400));
    }
  }

  // Handle password update
  if (updateData.password && updateData.confirmPassword) {
    if (updateData.password !== updateData.confirmPassword) {
      return next(
        new AppError("Password and confirm password do not match", 400)
      );
    }
    // Hash the new password
    updateData.password = await bcrypt.hash(updateData.password, 10);
    delete updateData.confirmPassword;
  } else if (updateData.password && !updateData.confirmPassword) {
    return next(
      new AppError("Confirm password is required when updating password", 400)
    );
  }

  // Update the user
  await currentUser.update(updateData);

  // Get updated user without password
  const updatedUser = await user.findByPk(currentUser.id, {
    attributes: { exclude: ["password", "deletedAt"] },
  });

  return res.status(200).json({
    status: "success",
    message: "Profile updated successfully",
    data: updatedUser,
  });
});

module.exports = {
  getAllUser,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getCurrentUser,
  updateCurrentUser,
};
