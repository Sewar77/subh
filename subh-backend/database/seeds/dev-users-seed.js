import bcrypt from "bcryptjs";
import pg from "pg";

const { Pool } = pg;
const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
  console.error("Refusing to run development user seed in production.");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required to run the development seed.");
  process.exit(1);
}

if (!process.env.SUBH_SEED_USER_PASSWORD) {
  console.error(
    "SUBH_SEED_USER_PASSWORD must be set before running the development seed.",
  );
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const seedUsers = [
  {
    email: "dev.user@subh.local",
    full_name: "Development User",
    phone_number: "+0000000000",
    role: "user",
    user_type: "individual",
    is_active: true,
    email_verified: true,
    password: process.env.SUBH_SEED_USER_PASSWORD,
  },
];

if (process.env.SUBH_SEED_ADMIN_PASSWORD) {
  seedUsers.push({
    email: "dev.admin@subh.local",
    full_name: "Development Admin",
    phone_number: "+0000000001",
    role: "admin",
    user_type: "company",
    is_active: true,
    email_verified: true,
    password: process.env.SUBH_SEED_ADMIN_PASSWORD,
  });
}

async function main() {
  for (const user of seedUsers) {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    await pool.query(
      `
        INSERT INTO public.users (
          full_name,
          email,
          phone_number,
          hashed_password,
          role,
          user_type,
          is_active,
          email_verified,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        ON CONFLICT ((LOWER(email)))
        DO UPDATE SET
          full_name = EXCLUDED.full_name,
          phone_number = EXCLUDED.phone_number,
          hashed_password = EXCLUDED.hashed_password,
          role = EXCLUDED.role,
          user_type = EXCLUDED.user_type,
          is_active = EXCLUDED.is_active,
          email_verified = EXCLUDED.email_verified,
          updated_at = NOW()
      `,
      [
        user.full_name,
        user.email,
        user.phone_number,
        hashedPassword,
        user.role,
        user.user_type,
        user.is_active,
        user.email_verified,
      ],
    );
  }

  console.log("Development users seeded safely.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
