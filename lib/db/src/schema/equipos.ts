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
import { proveedoresTable } from "./proveedores";

export const equiposTable = pgTable("equipos", {
  id: serial("id").primaryKey(),
  categoria: text("categoria").notNull(),
  equipo: text("equipo").notNull(),
  marca: text("marca").notNull(),
  modelo: text("modelo").notNull(),
  bateriaPct: integer("bateria_pct"),
  imeiSerial: text("imei_serial"),
  estadoEquipoCondicion: text("estado_equipo_condicion").notNull(),
  estado: text("estado").notNull().default("en_stock"),
  fechaCompra: date("fecha_compra", { mode: "string" }).notNull(),
  proveedorId: integer("proveedor_id").references(() => proveedoresTable.id, {
    onDelete: "set null",
  }),
  formaPagoCompra: text("forma_pago_compra").notNull(),
  precioCompra: numeric("precio_compra", {
    precision: 12,
    scale: 2,
  }).notNull(),
  gastosExtra: numeric("gastos_extra", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  costoTotal: numeric("costo_total", { precision: 12, scale: 2 }).notNull(),
  fechaVenta: date("fecha_venta", { mode: "string" }),
  plataformaVenta: text("plataforma_venta"),
  precioVenta: numeric("precio_venta", { precision: 12, scale: 2 }),
  ventaFormaPago: text("venta_forma_pago"),
  ventaNumeroCuotas: integer("venta_numero_cuotas"),
  ventaCuotasPagadas: integer("venta_cuotas_pagadas"),
  gananciaNeta: numeric("ganancia_neta", { precision: 12, scale: 2 }),
  comentarios: text("comentarios"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertEquipoSchema = createInsertSchema(equiposTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertEquipo = z.infer<typeof insertEquipoSchema>;
export type Equipo = typeof equiposTable.$inferSelect;
