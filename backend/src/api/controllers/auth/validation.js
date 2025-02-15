import Joi from "joi";

// Reusable string field
const stringRequired = (desc) =>
  Joi.string().trim().required().description(desc);

// ObjectId validation pattern for MongoDB
const objectId = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .description("Must be a valid MongoDB ObjectId");

// Strong password validation
const passwordSchema = Joi.string()
  .trim()
  .required()
  .pattern(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/
  )
  .description(
    "Password must be 8-30 characters with at least one uppercase, one lowercase, one number, and one special character"
  );

// Egyptian phone only validation
const phoneSchema = Joi.string()
  .trim()
  .pattern(/^(?:\+20|0)1[0-25]\d{8}$/)
  .required()
  .description("Egyptian phone number starting with +20 or 01");

export const registerValidation = {
  customer: Joi.object().keys({
    name: stringRequired("Full name of the customer"),
    email: stringRequired("Valid email address").email(),
    password: passwordSchema,
    phone: phoneSchema,
    address: stringRequired("Customer's address"),
    user_type: Joi.string()
      .valid("customer")
      .required()
      .description("Must be 'customer'"),
  }),

  driver: Joi.object().keys({
    name: stringRequired("Driver's full name"),
    email: stringRequired("Valid email address").email(),
    password: passwordSchema,
    phone: phoneSchema,
    address: stringRequired("Driver's address"),
    user_type: Joi.string().valid("driver").required(),

    license_number: stringRequired("Driver's unique license number"),
    license_image: Joi.string()
      .trim()
      .uri()
      .optional()
      .description("License image URL (optional)"),

    vehicle: objectId
      .required()
      .description("Reference to the driver's vehicle"),
  }),

  admin: Joi.object().keys({
    name: stringRequired("Admin's full name"),
    email: stringRequired("Valid email address").email(),
    password: passwordSchema,
    phone: phoneSchema,
    address: stringRequired("Admin's address"),
    user_type: Joi.string().valid("admin").required(),

    admin_level: Joi.string()
      .valid("super_admin", "manager", "support")
      .required()
      .description("Admin level: super_admin, manager, or support"),
    profit_percentage: Joi.number()
      .min(0)
      .max(100)
      .precision(2)
      .required()
      .description("Admin's profit percentage"),
  }),
};

export const loginValidation = Joi.object().keys({
  email: stringRequired("Valid email address").email(),
  password: passwordSchema,
});
