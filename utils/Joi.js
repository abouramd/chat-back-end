import Joi from "joi";

const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email.",
    "any.required": "Email is required.",
  }),
  username: Joi.string().min(6).required().messages({
    "string.min": "Userame must be at least 6 characters long.",
    "any.required": "Userame is required.",
  }),
  name: Joi.string().min(3).required().messages({
    "string.min": "Name must be at least 3 characters long.",
    "any.required": "Name is required.",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters long.",
    "any.required": "Password is required.",
  }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords must match.",
    "any.required": "Confirm password is required.",
  }),
});

const loginSchema = Joi.object({
  username: Joi.string().min(6).required().messages({
    "string.min": "Userame must be at least 6 characters long.",
    "any.required": "Userame is required.",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters long.",
    "any.required": "Password is required.",
  }),
});

const chatroomSchema = Joi.object({
  name: Joi.string().min(6).required().messages({
    "string.min": "name must be at least 6 characters long.",
    "any.required": "name is required.",
  }),
});

export { registerSchema, loginSchema, chatroomSchema };
