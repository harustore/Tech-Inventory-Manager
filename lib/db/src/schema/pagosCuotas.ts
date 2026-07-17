import {
  date,
  integer,
  numeric,
  pgTable,
  serial,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { equiposTable } from "./equipos";

export const pagosCuotasTable = pgTable("pagos_cuotas", {
  id: serial("id").primaryKey(),
  equipoId: integer("equipo_id")
    .notNull()
    .references(() => equiposTable.id, { onDelete: "cascade" }),
  monto: numeric("monto", { precision: 12, scale: 2 }).notNull(),
  fecha: date("fecha", { mode: "string" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertPagoCuotaSchema = createInsertSchema(pagosCuotasTable).omit(
  { id: true, createdAt: true },
);
export type InsertPagoCuota = z.infer<typeof insertPagoCuotaSchema>;
export type PagoCuota = typeof pagosCuotasTable.$inferSelect;
