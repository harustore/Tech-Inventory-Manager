import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const proveedoresTable = pgTable("proveedores", {
  id: serial("id").primaryKey(),
  nombre: text("nombre").notNull(),
  telefono: text("telefono"),
  facebook: text("facebook"),
  rut: text("rut"),
  usuarioMercadolibre: text("usuario_mercadolibre"),
  email: text("email"),
  direccion: text("direccion"),
  comentarios: text("comentarios"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .notNull()
    .defaultNow(),
});

export const insertProveedorSchema = createInsertSchema(proveedoresTable).omit({
  id: true,
  createdAt: true,
});
export type InsertProveedor = z.infer<typeof insertProveedorSchema>;
export type Proveedor = typeof proveedoresTable.$inferSelect;
