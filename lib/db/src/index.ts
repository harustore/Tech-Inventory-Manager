import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema/index.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

// node-postgres returns NUMERIC and BIGINT as strings; coerce them to numbers so
// the API keeps returning its numeric contract (as with the previous SQLite REALs).
pg.types.setTypeParser(20, parseInt); // int8 (e.g. count(*))
pg.types.setTypeParser(1700, parseFloat); // numeric

const { Pool } = pg;

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
