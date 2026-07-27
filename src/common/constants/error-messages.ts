// src/common/constants/error-messages.ts
export const ERROR_MESSAGES = {
  // Auth Errors
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_BLOCKED: 'Account is blocked',
  ACCOUNT_PENDING: 'Account is pending verification',
  USER_EXISTS: 'User already exists',
  INVALID_TOKEN: 'Invalid or expired token',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden access',

  // User Errors
  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXISTS: 'User already exists',
  INVALID_ROLE: 'Invalid role specified',

  // Booking Errors
  BOOKING_NOT_FOUND: 'Booking not found',
  INVALID_STATUS_TRANSITION: 'Invalid status transition',
  BOOKING_CANCELLED: 'Booking already cancelled',
  BOOKING_COMPLETED: 'Booking already completed',

  // Payment Errors
  PAYMENT_FAILED: 'Payment failed',
  INSUFFICIENT_FUNDS: 'Insufficient funds',
  PAYMENT_NOT_FOUND: 'Payment not found',

  // Validation Errors
  VALIDATION_FAILED: 'Validation failed',
  INVALID_EMAIL: 'Invalid email address',
  INVALID_PHONE: 'Invalid phone number',
  PASSWORD_TOO_WEAK: 'Password too weak',
  PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',

  // Database Errors
  DUPLICATE_ENTRY: 'Duplicate entry',
  FOREIGN_KEY_VIOLATION: 'Foreign key violation',

  // General Errors
  INTERNAL_SERVER_ERROR: 'Internal server error',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
};