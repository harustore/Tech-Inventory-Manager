import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "./schema/index.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export * from "./schema/index.js";

export {
  eq,
  and,
  or,
  desc,
  asc,
  like,
  gte,
  lte,
  sql,
  inArray,
  notInArray,
} from "drizzle-orm";
