import assert from "node:assert/strict";
import userRouter from "../src/routes/user.Routes.js";
import { serializeUser } from "../src/utils/userSerializer.js";
import {
  adminCreateUserSchema,
  adminPasswordUpdateSchema,
  adminUpdateUserSchema,
  registerUserSchema,
} from "../src/validation/auth.Validation.js";
import { registerUserAccount } from "../src/services/auth/registerUserService.js";

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
for (const privilegedField of [
  "verificationStatus",
  "reviewedAt",
  "reviewedByAdminId",
  "hashedPassword",
]) {
  assert.ok(
    registerUserSchema.validate({
      ...publicRegistration,
      [privilegedField]: "not-allowed",
    }).error,
    `Public registration must reject ${privilegedField}`,
  );
}

const companyRegistration = {
  ...publicRegistration,
  userType: "company",
  companyName: "Example Learning Company",
  employeeCount: 25,
  registrationNumber: "REG-2026-001",
  registrationState: "Cairo",
  website: "https://example.test",
};
assert.equal(registerUserSchema.validate(companyRegistration).error, undefined);
assert.equal(
  registerUserSchema.validate({
    ...companyRegistration,
    registrationNumber: undefined,
    ein: "12-3456789",
  }).error,
  undefined,
);
assert.ok(
  registerUserSchema.validate({
    ...companyRegistration,
    registrationNumber: undefined,
  }).error,
  "Company registration requires EIN or registration number",
);
assert.ok(
  registerUserSchema.validate({
    ...companyRegistration,
    employeeCount: 0,
  }).error,
  "Company employee count must be positive",
);
assert.ok(
  registerUserSchema.validate({
    ...companyRegistration,
    website: "not-a-url",
  }).error,
  "Company website must be an HTTP(S) URL",
);
assert.ok(
  registerUserSchema.validate({
    ...publicRegistration,
    companyName: "Not allowed for an individual",
  }).error,
  "Individual registration must reject company-only fields",
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

const companyUser = serializeUser(
  { ...serializedUser, id: 2, user_type: "company" },
  {
    companyView: "admin",
    companyProfile: {
      company_name: "Example Learning Company",
      employee_count: 25,
      ein: "12-3456789",
      registration_number: null,
      registration_state: "Cairo",
      website: "https://example.test",
      verification_status: "unverified",
      verification_note: "must-not-leak",
      reviewed_by_admin_id: 99,
      reviewed_at: "2026-01-03T00:00:00.000Z",
    },
  },
);
assert.equal(companyUser.companyProfile.companyName, "Example Learning Company");
assert.equal(companyUser.companyProfile.verificationStatus, "unverified");
assert.equal(Object.hasOwn(companyUser.companyProfile, "verification_note"), false);
assert.equal(Object.hasOwn(companyUser.companyProfile, "reviewedByAdminId"), false);
assert.equal(Object.hasOwn(companyUser.companyProfile, "reviewedAt"), false);

const transactionQueries = [];
let clientReleased = false;
const failingClient = {
  async query(sql) {
    const statement = sql.trim();
    transactionQueries.push(statement);
    if (statement === "BEGIN" || statement === "ROLLBACK") return { rows: [] };
    if (statement.includes("INSERT INTO users")) {
      return { rows: [{ id: 77, user_type: "company", role: "user" }] };
    }
    if (statement.includes("INSERT INTO company_profiles")) {
      throw new Error("Simulated company profile failure");
    }
    throw new Error("Unexpected transaction query");
  },
  release() {
    clientReleased = true;
  },
};

await assert.rejects(
  registerUserAccount(
    {
      user: {
        fullName: "Company Owner",
        email: "owner@example.test",
        phoneNumber: "+20 100 000 0002",
        hashedPassword: "test-only-hash",
        role: "user",
        userType: "company",
      },
      companyProfile: {
        companyName: "Example Learning Company",
        employeeCount: 25,
        registrationNumber: "REG-2026-001",
      },
    },
    { dbPool: { connect: async () => failingClient } },
  ),
  /Simulated company profile failure/,
);
assert.ok(transactionQueries.includes("BEGIN"));
assert.ok(transactionQueries.includes("ROLLBACK"));
assert.equal(transactionQueries.includes("COMMIT"), false);
assert.equal(clientReleased, true);

for (const layer of userRouter.stack) {
  if (!layer.route) continue;
  const handlerNames = layer.route.stack.map(({ handle }) => handle.name);
  assert.ok(handlerNames.includes("protect"), `${layer.route.path} lacks protect`);
  assert.ok(handlerNames.includes("adminOnly"), `${layer.route.path} lacks adminOnly`);
}

console.log("User/auth verification passed");
