import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const { Pool } = pg;
const migrationDir = path.resolve(process.cwd(), "database/migrations");
const migrationFiles = fs
  .readdirSync(migrationDir)
  .filter((file) => file.endsWith(".sql") && !file.startsWith("run-"))
  .sort();

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required to run database migrations.");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  for (const file of migrationFiles) {
    const filePath = path.join(migrationDir, file);
    const sql = fs.readFileSync(filePath, "utf8");

    console.log(`Applying ${file}`);
    await pool.query(sql);
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
