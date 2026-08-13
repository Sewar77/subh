import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const { Pool } = pg;
const migrationDir = path.resolve(process.cwd(), "database/migrations");
const migrationFiles = fs
  .readdirSync(migrationDir)
  .filter((file) => /^\d{3}_.+\.sql$/u.test(file))
  .sort();

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required to run database migrations.");
  process.exit(1);
}

if (process.env.SUBH_MIGRATIONS_APPROVED !== "true") {
  console.error(
    "Set SUBH_MIGRATIONS_APPROVED=true only after backing up and approving the target database.",
  );
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const appliedResult = await pool.query(
    "SELECT filename FROM public.schema_migrations",
  );
  const applied = new Set(appliedResult.rows.map(({ filename }) => filename));

  for (const file of migrationFiles) {
    if (applied.has(file)) {
      console.log(`Skipping already-applied ${file}`);
      continue;
    }

    const filePath = path.join(migrationDir, file);
    const sql = fs.readFileSync(filePath, "utf8");

    console.log(`Applying ${file}`);
    await pool.query(sql);
    await pool.query(
      "INSERT INTO public.schema_migrations (filename) VALUES ($1)",
      [file],
    );
  }

  console.log(`Applied ${migrationFiles.length} migration file(s).`);
}

main()
  .catch((error) => {
    console.error("Migration run failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
