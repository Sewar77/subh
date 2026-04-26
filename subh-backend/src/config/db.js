import pkg from "pg";
import dotenv from "dotenv";

const { Pool } = pkg;
dotenv.config();
const pool = new Pool({
  connectionString: process.env.DB_CONNECTION,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export default pool;
