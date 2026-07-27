import Joi from "joi";

const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const phonePattern = /^\+?[0-9\s-]{7,20}$/;

const fullNameSchema = Joi.string().trim().min(2).max(100);
const emailSchema = Joi.string().trim().lowercase().email();
const phoneSchema = Joi.string().trim().pattern(phonePattern);
const passwordSchema = Joi.string().min(8).pattern(passwordPattern);
const userTypeSchema = Joi.string()
  .valid("individual", "company")
  .allow(null);
const roleSchema = Joi.string().valid("user", "admin");

const withNameAlias = (schema) => schema.xor("name", "fullName");
const withOptionalNameAlias = (schema) => schema.oxor("name", "fullName");

export const registerUserSchema = withNameAlias(
  Joi.object({
    name: fullNameSchema,
    fullName: fullNameSchema,
    email: emailSchema.required(),
    phoneNumber: phoneSchema.required(),
    userType: userTypeSchema.required(),
    password: passwordSchema.required(),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
  }),
).unknown(false);

export const loginUserSchema = Joi.object({
  email: emailSchema.required(),
  password: Joi.string().min(8).required(),
}).unknown(false);

export const adminCreateUserSchema = withNameAlias(
  Joi.object({
    name: fullNameSchema,
    fullName: fullNameSchema,
    email: emailSchema.required(),
    phoneNumber: phoneSchema,
    // Legacy admin UI compatibility only; it maps to phone_number server-side.
    phone_Number: phoneSchema,
    password: passwordSchema.required(),
    confirmPassword: Joi.string().valid(Joi.ref("password")),
    role: roleSchema,
    // Legacy admin UI compatibility only; it maps to role server-side.
    userRole: roleSchema,
    userType: userTypeSchema.required(),
    isActive: Joi.boolean().default(true),
    emailVerified: Joi.boolean().default(false),
    // Existing admin form submits this field; it is accepted only as empty
    // compatibility data and is never persisted.
    address: Joi.valid("", null),
  })
    .xor("phoneNumber", "phone_Number")
    .oxor("role", "userRole"),
).unknown(false);

export const adminUpdateUserSchema = withOptionalNameAlias(
  Joi.object({
    name: fullNameSchema,
    fullName: fullNameSchema,
    email: emailSchema,
    phoneNumber: phoneSchema.allow(null),
    userType: userTypeSchema,
    role: roleSchema,
    userRole: roleSchema,
    isActive: Joi.boolean(),
    emailVerified: Joi.boolean(),
  })
    .oxor("role", "userRole")
    .or(
      "name",
      "fullName",
      "email",
      "phoneNumber",
      "userType",
      "role",
      "userRole",
      "isActive",
      "emailVerified",
    ),
).unknown(false);

export const userStatusSchema = Joi.object({
  isActive: Joi.boolean().required(),
}).unknown(false);

export const adminPasswordUpdateSchema = Joi.object({
  password: passwordSchema.required(),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
}).unknown(false);

export const userIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
}).unknown(false);

export const emailLookupSchema = Joi.object({
  email: emailSchema.required(),
}).unknown(false);
