const { z } = require('zod');

// User validation schemas
const createUserSchema = z.object({
  body: z.object({
    userType: z.enum(['1', '2'], {
      errorMap: () => ({ message: 'User type must be either 1 or 2' })
    }),
    firstName: z.string()
      .min(1, 'First name is required')
      .max(50, 'First name must be less than 50 characters')
      .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'),
    lastName: z.string()
      .min(1, 'Last name is required')
      .max(50, 'Last name must be less than 50 characters')
      .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces'),
    email: z.string()
      .email('Invalid email format')
      .max(100, 'Email must be less than 100 characters'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters long')
      .max(100, 'Password must be less than 100 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    confirmPassword: z.string()
      .min(8, 'Confirm password must be at least 8 characters long'),
    isActive: z.boolean().optional(),
    avatarUrl: z.string()
      .url('Avatar URL must be a valid URL')
      .optional()
      .or(z.literal('')),
    createdBy: z.number()
      .int('CreatedBy must be a valid integer')
      .positive('CreatedBy must be a positive number')
      .optional()
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
});

const updateUserSchema = z.object({
  body: z.object({
    userType: z.enum(['1', '2']).optional(),
    firstName: z.string()
      .min(1, 'First name is required')
      .max(50, 'First name must be less than 50 characters')
      .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces')
      .optional(),
    lastName: z.string()
      .min(1, 'Last name is required')
      .max(50, 'Last name must be less than 50 characters')
      .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces')
      .optional(),
    email: z.string()
      .email('Invalid email format')
      .max(100, 'Email must be less than 100 characters')
      .optional(),
    password: z.string()
      .min(8, 'Password must be at least 8 characters long')
      .max(100, 'Password must be less than 100 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number')
      .optional(),
    confirmPassword: z.string()
      .min(8, 'Confirm password must be at least 8 characters long')
      .optional(),
    isActive: z.boolean().optional(),
    avatarUrl: z.string()
      .url('Avatar URL must be a valid URL')
      .optional()
      .or(z.literal('')),
    createdBy: z.number()
      .int('CreatedBy must be a valid integer')
      .positive('CreatedBy must be a positive number')
      .optional()
  }).refine((data) => {
    if (data.password && data.confirmPassword) {
      return data.password === data.confirmPassword;
    }
    return true;
  }, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string()
      .email('Invalid email format')
      .max(100, 'Email must be less than 100 characters'),
    password: z.string()
      .min(1, 'Password is required')
  })
});

const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string()
      .regex(/^\d+$/, 'User ID must be a valid number')
      .transform((val) => parseInt(val, 10))
  })
});

const deleteUserSchema = z.object({
  params: z.object({
    id: z.string()
      .regex(/^\d+$/, 'User ID must be a valid number')
      .transform((val) => parseInt(val, 10))
  })
});

// Validation middleware function
const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError && error.issues) {
        const errorMessages = error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        const AppError = require('./appError');
        const validationMessage = errorMessages.map(err => err.message).join(', ');
        return next(new AppError(`Validation failed: ${validationMessage}`, 400));
      }
      next(error);
    }
  };
};

module.exports = {
  createUserSchema,
  updateUserSchema,
  loginSchema,
  getUserByIdSchema,
  deleteUserSchema,
  validate
};
