import Joi from 'joi';

export const registerValidation = {
  customer: Joi.object({
    name: Joi.string().required().min(3).max(50),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6).max(30),
    phone: Joi.string().required().pattern(/^\+?[1-9]\d{1,14}$/),
    address: Joi.string().required(),
    user_type: Joi.string().required().valid('customer')
  }),

  driver: Joi.object({
    name: Joi.string().required().min(3).max(50),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6).max(30),
    phone: Joi.string().required().pattern(/^\+?[1-9]\d{1,14}$/),
    address: Joi.string().required(),
    user_type: Joi.string().required().valid('driver'),
    license_number: Joi.string().required(),
    vehicle_info: Joi.string().required()
  }),

  admin: Joi.object({
    name: Joi.string().required().min(3).max(50),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6).max(30),
    phone: Joi.string().required().pattern(/^\+?[1-9]\d{1,14}$/),
    address: Joi.string().required(),
    user_type: Joi.string().required().valid('admin'),
    admin_level: Joi.string().required().valid('super_admin', 'manager', 'support'),
    profit_percentage: Joi.number().required().min(0).max(100)
  })
};

export const loginValidation = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required()
});