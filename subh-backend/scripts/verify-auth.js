import assert from "node:assert/strict";
import userRouter from "../src/routes/user.Routes.js";
import { serializeUser } from "../src/utils/userSerializer.js";
import {
  adminCreateUserSchema,
  adminPasswordUpdateSchema,
  adminUpdateUserSchema,
  registerUserSchema,
} from "../src/validation/auth.Validation.js";

const publicRegistration = {
  name: "Sewar Example",
  email: "SEWAR@example.com",
  phoneNumber: "+20 100 000 0000",
  userType: "individual",
  password: "SecurePass1!",
  confirmPassword: "SecurePass1!",
};

assert.equal(registerUserSchema.validate(publicRegistration).error, undefined);
assert.ok(
  registerUserSchema.validate({ ...publicRegistration, role: "admin" }).error,
  "Public registration must reject a caller-provided role",
);
assert.ok(
  registerUserSchema.validate({ ...publicRegistration, isActive: true }).error,
  "Public registration must reject admin-only status fields",
);
const { confirmPassword, ...adminRegistration } = publicRegistration;
assert.equal(
  adminCreateUserSchema.validate({
    ...adminRegistration,
    role: "admin",
  }).error,
  undefined,
);
assert.equal(
  adminCreateUserSchema.validate({
    name: "Legacy Admin",
    email: "legacy.admin@example.com",
    phone_Number: "+20 100 000 0001",
    password: "SecurePass1!",
    confirmPassword: "SecurePass1!",
    userRole: "admin",
    userType: "individual",
    address: "",
  }).error,
  undefined,
);
assert.ok(
  adminUpdateUserSchema.validate({ hashed_password: "not allowed" }).error,
  "Generic user updates must reject password hashes",
);
assert.equal(adminUpdateUserSchema.validate({ isActive: false }).error, undefined);
assert.equal(
  adminPasswordUpdateSchema.validate({
    password: "SecurePass1!",
    confirmPassword: "SecurePass1!",
  }).error,
  undefined,
);

const serializedUser = serializeUser({
  id: 1,
  full_name: "Sewar Example",
  email: "sewar@example.com",
  phone_number: "+20 100 000 0000",
  role: "admin",
  user_type: "individual",
  is_active: true,
  email_verified: false,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-02T00:00:00.000Z",
  hashed_password: "must-not-leak",
});
assert.equal(serializedUser.name, "Sewar Example");
assert.equal(serializedUser.fullName, "Sewar Example");
assert.equal(serializedUser.phoneNumber, "+20 100 000 0000");
assert.equal(Object.hasOwn(serializedUser, "hashed_password"), false);
assert.equal(Object.hasOwn(serializedUser, "password"), false);

for (const layer of userRouter.stack) {
  if (!layer.route) continue;
  const handlerNames = layer.route.stack.map(({ handle }) => handle.name);
  assert.ok(handlerNames.includes("protect"), `${layer.route.path} lacks protect`);
  assert.ok(handlerNames.includes("adminOnly"), `${layer.route.path} lacks adminOnly`);
}

console.log("User/auth verification passed");
