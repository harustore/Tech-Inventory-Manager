import initSqlJs from "sql.js";
import { drizzle } from "drizzle-orm/sql-js";
import * as schema from "./schema";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";

const DB_PATH = join(process.cwd(), "data", "techstock.db");

const SQL = await initSqlJs();
const dir = dirname(DB_PATH);
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

const buffer = existsSync(DB_PATH) ? readFileSync(DB_PATH) : null;
const client = new SQL.Database(buffer ?? undefined);

client.run("PRAGMA foreign_keys = ON");
client.run("PRAGMA journal_mode = WAL");

client.run(`CREATE TABLE IF NOT EXISTS proveedores (
  id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT NOT NULL, telefono TEXT,
  facebook TEXT, rut TEXT, usuario_mercadolibre TEXT, email TEXT,
  direccion TEXT, comentarios TEXT, created_at TEXT NOT NULL
)`);
client.run(`CREATE TABLE IF NOT EXISTS equipos (
  id INTEGER PRIMARY KEY AUTOINCREMENT, categoria TEXT NOT NULL,
  equipo TEXT NOT NULL, marca TEXT NOT NULL, modelo TEXT NOT NULL,
  bateria_pct INTEGER, imei_serial TEXT,
  estado_equipo_condicion TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'en_stock',
  fecha_compra TEXT NOT NULL,
  proveedor_id INTEGER REFERENCES proveedores(id) ON DELETE SET NULL,
  forma_pago_compra TEXT NOT NULL, precio_compra REAL NOT NULL,
  gastos_extra REAL NOT NULL DEFAULT 0, costo_total REAL NOT NULL,
  fecha_venta TEXT, plataforma_venta TEXT, precio_venta REAL,
  venta_forma_pago TEXT, venta_numero_cuotas INTEGER,
  venta_cuotas_pagadas INTEGER, ganancia_neta REAL, comentarios TEXT,
  seller_name TEXT, seller_rut TEXT, seller_contact TEXT,
  purchase_meeting_place TEXT,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
)`);
client.run(`CREATE TABLE IF NOT EXISTS movimientos_caja (
  id INTEGER PRIMARY KEY AUTOINCREMENT, tipo TEXT NOT NULL,
  monto REAL NOT NULL, motivo TEXT NOT NULL, fecha TEXT NOT NULL,
  equipo_id INTEGER REFERENCES equipos(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL
)`);
client.run(`CREATE TABLE IF NOT EXISTS pagos_cuotas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  equipo_id INTEGER NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
  monto REAL NOT NULL, fecha TEXT NOT NULL, created_at TEXT NOT NULL
)`);

function addColumnIfNotExists(table: string, column: string, type: string) {
  const columns = client.exec(`PRAGMA table_info(${table})`);
  const names = columns[0]?.values.map((v: unknown[]) => String(v[1])) ?? [];
  if (!names.includes(column)) {
    client.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
  }
}

addColumnIfNotExists("equipos", "buyer_name", "TEXT");
addColumnIfNotExists("equipos", "buyer_rut", "TEXT");
addColumnIfNotExists("equipos", "buyer_contact", "TEXT");
addColumnIfNotExists("equipos", "meeting_place", "TEXT");
addColumnIfNotExists("equipos", "buyer_payment_method", "TEXT");
addColumnIfNotExists("equipos", "seller_name", "TEXT");
addColumnIfNotExists("equipos", "seller_rut", "TEXT");
addColumnIfNotExists("equipos", "seller_contact", "TEXT");
addColumnIfNotExists("equipos", "purchase_meeting_place", "TEXT");

writeFileSync(DB_PATH, Buffer.from(client.export()));

export const db = drizzle(client, { schema });

export function persist() {
  writeFileSync(DB_PATH, Buffer.from(client.export()));
}

export * from "./schema";
export {
  eq, and, or, desc, asc, like, gte, lte, sql, inArray, notInArray,
} from "drizzle-orm";
