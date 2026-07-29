import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { equiposTable } from "./equipos";

export const pagosCuotasTable = sqliteTable("pagos_cuotas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  equipoId: integer("equipo_id")
    .notNull()
    .references(() => equiposTable.id, { onDelete: "cascade" }),
  monto: real("monto").notNull(),
  fecha: text("fecha").notNull(),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const insertPagoCuotaSchema = createInsertSchema(pagosCuotasTable).omit(
  { id: true, createdAt: true },
);
export type InsertPagoCuota = z.infer<typeof insertPagoCuotaSchema>;
export type PagoCuota = typeof pagosCuotasTable.$inferSelect;
