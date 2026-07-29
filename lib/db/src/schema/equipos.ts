import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { proveedoresTable } from "./proveedores";

export const equiposTable = sqliteTable("equipos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  categoria: text("categoria").notNull(),
  equipo: text("equipo").notNull(),
  marca: text("marca").notNull(),
  modelo: text("modelo").notNull(),
  bateriaPct: integer("bateria_pct"),
  imeiSerial: text("imei_serial"),
  estadoEquipoCondicion: text("estado_equipo_condicion").notNull(),
  estado: text("estado").notNull().default("en_stock"),
  fechaCompra: text("fecha_compra").notNull(),
  proveedorId: integer("proveedor_id").references(() => proveedoresTable.id, {
    onDelete: "set null",
  }),
  formaPagoCompra: text("forma_pago_compra").notNull(),
  precioCompra: real("precio_compra").notNull(),
  gastosExtra: real("gastos_extra").notNull().default(0),
  costoTotal: real("costo_total").notNull(),
  fechaVenta: text("fecha_venta"),
  plataformaVenta: text("plataforma_venta"),
  precioVenta: real("precio_venta"),
  ventaFormaPago: text("venta_forma_pago"),
  ventaNumeroCuotas: integer("venta_numero_cuotas"),
  ventaCuotasPagadas: integer("venta_cuotas_pagadas"),
  gananciaNeta: real("ganancia_neta"),
  buyerName: text("buyer_name"),
  buyerRut: text("buyer_rut"),
  buyerContact: text("buyer_contact"),
  meetingPlace: text("meeting_place"),
  buyerPaymentMethod: text("buyer_payment_method"),
  sellerName: text("seller_name"),
  sellerRut: text("seller_rut"),
  sellerContact: text("seller_contact"),
  purchaseMeetingPlace: text("purchase_meeting_place"),
  comentarios: text("comentarios"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const insertEquipoSchema = createInsertSchema(equiposTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertEquipo = z.infer<typeof insertEquipoSchema>;
export type Equipo = typeof equiposTable.$inferSelect;
