import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const proveedoresTable = sqliteTable("proveedores", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nombre: text("nombre").notNull(),
  telefono: text("telefono"),
  facebook: text("facebook"),
  rut: text("rut"),
  usuarioMercadolibre: text("usuario_mercadolibre"),
  email: text("email"),
  direccion: text("direccion"),
  comentarios: text("comentarios"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const insertProveedorSchema = createInsertSchema(proveedoresTable).omit({
  id: true,
  createdAt: true,
});
export type InsertProveedor = z.infer<typeof insertProveedorSchema>;
export type Proveedor = typeof proveedoresTable.$inferSelect;
