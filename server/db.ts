import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

const DB_URL = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
if (!DB_URL) {
  console.error("WARNING: No database URL set. DB operations will fail.");
}

export const pool = new Pool({
  connectionString: DB_URL || "postgresql://localhost/placeholder",
  ssl: { rejectUnauthorized: false },
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Database connected successfully at:', res.rows?.[0]?.now);
  }
});

export const db = drizzle(pool, { schema });
