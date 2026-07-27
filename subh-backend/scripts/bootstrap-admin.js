import bcrypt from "bcryptjs";
import pool from "../src/config/db.js";
import {
  createUser,
  getUserByEmailForAuth,
  normalizeEmail,
  normalizeFullName,
} from "../src/models/auth.Models.js";

const requiredEnvironment = [
  "SUBH_BOOTSTRAP_ADMIN_NAME",
  "SUBH_BOOTSTRAP_ADMIN_EMAIL",
  "SUBH_BOOTSTRAP_ADMIN_PASSWORD",
];

const missingEnvironment = requiredEnvironment.filter(
  (key) => !process.env[key]?.trim(),
);

const run = async () => {
  if (missingEnvironment.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingEnvironment.join(", ")}`,
    );
  }

  const email = normalizeEmail(process.env.SUBH_BOOTSTRAP_ADMIN_EMAIL);
  const existingUser = await getUserByEmailForAuth(email);
  if (existingUser) {
    console.log("An account already exists for the bootstrap administrator email.");
    return;
  }

  const user = await createUser({
    fullName: normalizeFullName(process.env.SUBH_BOOTSTRAP_ADMIN_NAME),
    email,
    phoneNumber: process.env.SUBH_BOOTSTRAP_ADMIN_PHONE?.trim() || null,
    hashedPassword: await bcrypt.hash(process.env.SUBH_BOOTSTRAP_ADMIN_PASSWORD, 10),
    role: "admin",
    userType: null,
    isActive: true,
    emailVerified: true,
  });

  console.log(`Bootstrap administrator created with id ${user.id}.`);
};

try {
  await run();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
