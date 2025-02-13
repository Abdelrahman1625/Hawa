import Joi from "joi";

export const registerValidation = {
  customer: Joi.object({
    name: Joi.string().required().min(3).max(50),
    email: Joi.string().required().email(),
    password: Joi.string()
      .required()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/
      ),
    phone: Joi.string()
      .required()
      .pattern(/^(?:\+20|0)1[0-25]\d{8}$/),
    address: Joi.string().required(),
    user_type: Joi.string().required().valid("customer"),
  }),

  driver: Joi.object({
    name: Joi.string().required().min(3).max(50),
    email: Joi.string().required().email(),
    password: Joi.string()
      .required()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/
      ),
    phone: Joi.string()
      .required()
      .pattern(/^(?:\+20|0)1[0-25]\d{8}$/),
    address: Joi.string().required(),
    user_type: Joi.string().required().valid("driver"),
    license_number: Joi.string().required(), // unique , Must be image ?
    vehicle_info: Joi.string().required(),
  }),

  admin: Joi.object({
    name: Joi.string().required().min(3).max(50),
    email: Joi.string().required().email(),
    password: Joi.string()
      .required()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/
      ),
    phone: Joi.string()
      .required()
      .pattern(/^(?:\+20|0)1[0-25]\d{8}$/),
    address: Joi.string().required(),
    user_type: Joi.string().required().valid("admin"),
    admin_level: Joi.string()
      .required()
      .valid("super_admin", "manager", "support"),
    profit_percentage: Joi.number().required().min(0).max(100),
  }),
};

export const loginValidation = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string()
    .required()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/
    ),
});
