import fs from "node:fs";
import path from "node:path";

const seedDir = path.resolve(process.cwd(), "database/seeds");
const seedScript = path.join(seedDir, "dev-users-seed.js");

if (!fs.existsSync(seedScript)) {
  console.error("The development seed script is missing.");
  process.exit(1);
}

console.log("Seed runner is ready to invoke the development seed script.");
console.log(
  "Use the database environment variables only and do not execute this in production.",
);
