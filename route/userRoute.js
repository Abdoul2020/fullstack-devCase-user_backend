const { authenticateToken, restrictTo } = require('../controller/authController');
const { 
    getAllUser, 
    getUserById, 
    createUser, 
    updateUser, 
    deleteUser,
    getCurrentUser,
    updateCurrentUser
} = require('../controller/userController');
const { 
    validate, 
    createUserSchema, 
    updateUserSchema, 
    getUserByIdSchema, 
    deleteUserSchema 
} = require('../utils/validationSchemas');

const router = require('express').Router();

// Admin routes (userType '0' only)
router.route('/')
    .get(authenticateToken, restrictTo('0'), getAllUser)
    .post(authenticateToken, restrictTo('0'), validate(createUserSchema), createUser);

// Current user routes (authenticated users) - MUST come before /:id route
router.route('/me')
    .get(authenticateToken, getCurrentUser)
    .put(authenticateToken, validate(updateUserSchema), updateCurrentUser);

router.route('/:id')
    .get(authenticateToken, restrictTo('0'), validate(getUserByIdSchema), getUserById)
    .patch(authenticateToken, restrictTo('0'), validate(updateUserSchema), updateUser)
    .delete(authenticateToken, restrictTo('0'), validate(deleteUserSchema), deleteUser);

module.exports = router;