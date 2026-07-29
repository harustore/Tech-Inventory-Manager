import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { equiposTable } from "./equipos";

export const movimientosCajaTable = sqliteTable("movimientos_caja", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tipo: text("tipo").notNull(),
  monto: real("monto").notNull(),
  motivo: text("motivo").notNull(),
  fecha: text("fecha").notNull(),
  equipoId: integer("equipo_id").references(() => equiposTable.id, {
    onDelete: "set null",
  }),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const insertMovimientoCajaSchema = createInsertSchema(
  movimientosCajaTable,
).omit({ id: true, createdAt: true });
export type InsertMovimientoCaja = z.infer<typeof insertMovimientoCajaSchema>;
export type MovimientoCaja = typeof movimientosCajaTable.$inferSelect;
