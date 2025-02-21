import { body, param, validationResult } from 'express-validator';

// Helper function to handle validation results
const handleValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// User creation validation
export const validateUserCreation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 3, max: 50 }).withMessage('Name must be between 3 and 50 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^\+?[1-9]\d{1,14}$/).withMessage('Invalid phone number format'),
  
  body('address')
    .trim()
    .notEmpty().withMessage('Address is required'),
  
  body('user_type')
    .trim()
    .notEmpty().withMessage('User type is required')
    .isIn(['customer', 'driver', 'admin']).withMessage('Invalid user type'),

  // Conditional validation for specific user types
  body('license_number')
    .if(body('user_type').equals('driver'))
    .notEmpty().withMessage('License number is required for drivers'),
  
  body('vehicle_info')
    .if(body('user_type').equals('driver'))
    .notEmpty().withMessage('Vehicle information is required for drivers')
    .isObject().withMessage('Vehicle information must be an object'),
  
  body('admin_level')
    .if(body('user_type').equals('admin'))
    .notEmpty().withMessage('Admin level is required')
    .isIn(['super_admin', 'manager', 'support']).withMessage('Invalid admin level'),

  handleValidationResult
];

// Profile update validation
export const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage('Name must be between 3 and 50 characters'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/).withMessage('Invalid phone number format'),
  
  body('address')
    .optional()
    .trim(),
  
  body('vehicle_info')
    .optional()
    .custom((value, { req }) => {
      if (req.user.user_type === 'driver') {
        if (!value) {
          throw new Error('Vehicle information is required for drivers');
        }
        if (typeof value !== 'object') {
          throw new Error('Vehicle information must be an object');
        }
      }
      return true;
    }),

  // Prevent updating sensitive fields
  body('user_type').not().exists().withMessage('User type cannot be updated'),
  body('password').not().exists().withMessage('Use /password endpoint to update password'),
  body('email').not().exists().withMessage('Email cannot be updated directly'),

  handleValidationResult
];

// Password change validation
export const validatePasswordChange = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    }),

  handleValidationResult
];

// Ride request validation
export const validateRideRequest = [
  body('pickup_location')
    .notEmpty().withMessage('Pickup location is required')
    .isObject().withMessage('Pickup location must be an object')
    .custom((value) => {
      if (!value.latitude || !value.longitude) {
        throw new Error('Pickup location must include latitude and longitude');
      }
      return true;
    }),

  body('dropoff_location')
    .notEmpty().withMessage('Dropoff location is required')
    .isObject().withMessage('Dropoff location must be an object')
    .custom((value) => {
      if (!value.latitude || !value.longitude) {
        throw new Error('Dropoff location must include latitude and longitude');
      }
      return true;
    }),

  body('ride_type')
    .notEmpty().withMessage('Ride type is required')
    .isIn(['standard', 'premium', 'pool']).withMessage('Invalid ride type'),

  body('payment_method')
    .notEmpty().withMessage('Payment method is required')
    .isIn(['cash', 'card', 'wallet']).withMessage('Invalid payment method'),

  handleValidationResult
];

// Payment validation
export const validatePayment = [
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),

  body('payment_method')
    .notEmpty().withMessage('Payment method is required')
    .isIn(['cash', 'card', 'wallet']).withMessage('Invalid payment method'),

  body('ride_id')
    .notEmpty().withMessage('Ride ID is required')
    .isMongoId().withMessage('Invalid ride ID format'),

  body('currency')
    .notEmpty().withMessage('Currency is required')
    .isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code')
    .isUppercase().withMessage('Currency must be uppercase'),

  handleValidationResult
];

// Review validation
export const validateReview = [
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),

  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Comment must not exceed 500 characters'),

  body('ride_id')
    .notEmpty().withMessage('Ride ID is required')
    .isMongoId().withMessage('Invalid ride ID format'),

  handleValidationResult
];

// Admin actions validation
export const validateAdminActions = [
  body('action')
    .notEmpty().withMessage('Action is required')
    .isIn(['approve', 'reject', 'suspend', 'activate']).withMessage('Invalid action'),

  body('reason')
    .if(body('action').isIn(['reject', 'suspend']))
    .notEmpty().withMessage('Reason is required for reject or suspend actions')
    .isLength({ min: 10, max: 200 }).withMessage('Reason must be between 10 and 200 characters'),

  param('id')
    .if(param('id').exists())
    .isMongoId().withMessage('Invalid ID format'),

  handleValidationResult
];

// Ride status update validation
export const validateRideStatus = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['accepted', 'started', 'completed', 'cancelled']).withMessage('Invalid ride status'),

  body('reason')
    .if(body('status').equals('cancelled'))
    .notEmpty().withMessage('Reason is required when cancelling a ride')
    .isLength({ min: 10, max: 200 }).withMessage('Reason must be between 10 and 200 characters'),

  param('id')
    .isMongoId().withMessage('Invalid ride ID format'),

  handleValidationResult
];

// Payment status update validation
export const validatePaymentStatus = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['pending', 'completed', 'failed', 'refunded']).withMessage('Invalid payment status'),

  body('transaction_id')
    .if(body('status').equals('completed'))
    .notEmpty().withMessage('Transaction ID is required for completed payments'),

  body('reason')
    .if(body('status').isIn(['failed', 'refunded']))
    .notEmpty().withMessage('Reason is required for failed or refunded payments')
    .isLength({ min: 10, max: 200 }).withMessage('Reason must be between 10 and 200 characters'),

  param('id')
    .isMongoId().withMessage('Invalid payment ID format'),

  handleValidationResult
];