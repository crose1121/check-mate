// server/src/db.ts
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config(); // loads PGHOST, PGUSER, etc. from .env

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // e.g. postgres://user:pass@localhost:5432/mydb
});
