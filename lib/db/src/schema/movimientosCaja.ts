import {
  date,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { equiposTable } from "./equipos";

export const movimientosCajaTable = pgTable("movimientos_caja", {
  id: serial("id").primaryKey(),
  tipo: text("tipo").notNull(),
  monto: numeric("monto", { precision: 12, scale: 2 }).notNull(),
  motivo: text("motivo").notNull(),
  fecha: date("fecha", { mode: "string" }).notNull(),
  equipoId: integer("equipo_id").references(() => equiposTable.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertMovimientoCajaSchema = createInsertSchema(
  movimientosCajaTable,
).omit({ id: true, createdAt: true });
export type InsertMovimientoCaja = z.infer<typeof insertMovimientoCajaSchema>;
export type MovimientoCaja = typeof movimientosCajaTable.$inferSelect;
