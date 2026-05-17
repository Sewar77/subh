import Joi from "joi";
export const registerUserSchema = Joi.object({
  name: Joi.string().min(10).required().messages({
    "string.base": "Name must be text",
    "string.empty": "Name is required",
    "string.min": "Name must be First and Last Name",
    "any.required": "Name is required",
  }),

  address: Joi.string().alphanum().min(3).allow("", null).messages({
    "string.base": "Address must be text",
    "string.alphanum": "Address must contain only letters and numbers",
    "string.min": "Address must be at least 3 characters",
  }),

  userType: Joi.string()
    .valid("individual", "company")
    .default("individual")
    .required()
    .messages({
      "any.only": "User type must be either individual or company",
      "any.required": "User type is required",
      "string.base": "User type must be text",
    }),

  password: Joi.string()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
      ),
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters, include uppercase, lowercase, number, and special character",
      "string.empty": "Password is required",
      "any.required": "Password is required",
    }),

  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
    "any.required": "Confirm password is required",
    "string.empty": "Confirm password is required",
  }),

  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email address",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),

  phoneNumber: Joi.string()
    .min(7)
    .max(15)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      "string.empty": "Phone number is required",
      "string.min": "Phone number must be at least 7 digits",
      "string.max": "Phone number must not exceed 15 digits",
      "string.pattern.base": "Phone number must contain digits only",
      "any.required": "Phone number is required",
    }),

  role: Joi.string().valid("user", "admin").default("user").messages({
    "any.only": "Role must be user or admin",
  }),
});

export const loginUserSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email address",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),
  password: Joi.string()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
      ),
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters, include uppercase, lowercase, number, and special character",
      "string.empty": "Password is required",
      "any.required": "Password is required",
    }),
});
