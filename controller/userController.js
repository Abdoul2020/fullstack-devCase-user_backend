const { Sequelize } = require("sequelize");
const { user } = require("../db/models");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const bcrypt = require("bcrypt");

// Get all users (except admin)
const getAllUser = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, search, isActive, createdBy } = req.query;
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

  // Add isActive filter
  if (isActive !== undefined) {
    whereClause.isActive = isActive === 'true';
  }

  // Add createdBy filter
  if (createdBy) {
    whereClause.createdBy = createdBy;
  }

  const users = await user.findAndCountAll({
    where: whereClause,
    attributes: { exclude: ["password","deletedAt"] },
    include: [{
      association: 'creator',
      required: false,
      attributes: ['id', 'firstName', 'lastName', 'email']
    }],
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
    include: [{
      association: 'creator',
      required: false,
      attributes: ['id', 'firstName', 'lastName', 'email']
    }]
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
  const { 
    userType, 
    firstName, 
    lastName, 
    email, 
    password, 
    confirmPassword,
    isActive = true,
    avatarUrl,
    createdBy
  } = req.body;

  // Check if user already exists
  const existingUser = await user.findOne({ where: { email } });
  if (existingUser) {
    return next(new AppError("User with this email already exists", 400));
  }

  // Validate createdBy if provided
  if (createdBy) {
    const creator = await user.findByPk(createdBy);
    if (!creator) {
      return next(new AppError("Invalid createdBy user ID", 400));
    }
  }

  // Create new user
  const newUser = await user.create({
    userType,
    firstName,
    lastName,
    email,
    confirmPassword,
    isActive,
    avatarUrl,
    createdBy: createdBy || req.user?.id, 
  });

  if (!newUser) {
    return next(new AppError("Failed to create user", 400));
  }

  // Get the user with creator information
  const userWithCreator = await user.findByPk(newUser.id, {
    attributes: { exclude: ["password"] },
    include: [{
      association: 'creator',
      required: false,
      attributes: ['id', 'firstName', 'lastName', 'email']
    }]
  });

  const result = userWithCreator.toJSON();
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

  // Validate createdBy if being updated
  if (updateData.createdBy) {
    const creator = await user.findByPk(updateData.createdBy);
    if (!creator) {
      return next(new AppError("Invalid createdBy user ID", 400));
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

  const updatedUser = await user.findByPk(id, {
    attributes: { exclude: ["password"] },
    include: [{
      association: 'creator',
      required: false,
      attributes: ['id', 'firstName', 'lastName', 'email']
    }]
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

  // Prevent updating isActive for current user (only admin can do this)
  if (updateData.isActive !== undefined) {
    delete updateData.isActive;
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

// Activate user
const activateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const foundUser = await user.findByPk(id);
  if (!foundUser) {
    return next(new AppError("User not found", 404));
  }

  // Check if trying to activate admin user (userType '0')
  if (foundUser.userType === "0") {
    return next(new AppError("Cannot modify admin user", 403));
  }

  await foundUser.update({ isActive: true });

  return res.status(200).json({
    status: "success",
    message: "User activated successfully",
  });
});

// Deactivate user
const deactivateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const foundUser = await user.findByPk(id);
  if (!foundUser) {
    return next(new AppError("User not found", 404));
  }

  // Check if trying to deactivate admin user (userType '0')
  if (foundUser.userType === "0") {
    return next(new AppError("Cannot modify admin user", 403));
  }

  await foundUser.update({ isActive: false });

  return res.status(200).json({
    status: "success",
    message: "User deactivated successfully",
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
  activateUser,
  deactivateUser,
};
