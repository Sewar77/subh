import Joi from "joi";

export const registerUserSchema = Joi.object({
  name: Joi.string().alphanum().min(3).max(30).required(),
  address: Joi.string().alphanum().min(3),
  userType: Joi.string().valid("individual", "company").default("individual"),
  password: Joi.string()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
      ),
    )
    .required(),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
  email: Joi.string().email().required(),
  phone_Number: Joi.number().allow(null),
  role: Joi.string().valid("user", "admin").default("user"),
});

export const loginUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
      ),
    )
    .required(),
});
