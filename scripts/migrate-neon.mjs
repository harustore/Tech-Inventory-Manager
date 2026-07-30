import pg from "pg";
import { db, persist, proveedoresTable, equiposTable, movimientosCajaTable, pagosCuotasTable } from "@workspace/db";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL env var required");
  process.exit(1);
}

const neon = new pg.Client(DATABASE_URL);
await neon.connect();

// Read all data from Neon
const proveedores = (await neon.query("SELECT * FROM proveedores")).rows;
const equipos = (await neon.query("SELECT * FROM equipos")).rows;
const movimientos = (await neon.query("SELECT * FROM movimientos_caja")).rows;
const pagos = (await neon.query("SELECT * FROM pagos_cuotas")).rows;

console.log(`NeonDB: ${proveedores.length} proveedores, ${equipos.length} equipos, ${movimientos.length} movimientos, ${pagos.length} pagos`);

// Map PostgreSQL column names to SQLite/Drizzle column names
function mapRow(row, table) {
  const m = {};
  for (const [k, v] of Object.entries(row)) {
    const col = SNAKE_TO_CAMEL[k] || k;
    m[col] = v ?? null;
  }
  // Map known differences
  if (table === "equipos") {
    m.createdAt = row.created_at;
    m.updatedAt = row.updated_at;
    m.proveedorId = row.proveedor_id;
    m.bateriaPct = row.bateria_pct;
    m.imeiSerial = row.imei_serial;
    m.estadoEquipoCondicion = row.estado_equipo_condicion;
    m.fechaCompra = row.fecha_compra;
    m.formaPagoCompra = row.forma_pago_compra;
    m.precioCompra = Number(row.precio_compra);
    m.gastosExtra = Number(row.gastos_extra);
    m.costoTotal = Number(row.costo_total);
    m.fechaVenta = row.fecha_venta;
    m.plataformaVenta = row.plataforma_venta;
    m.precioVenta = row.precio_venta != null ? Number(row.precio_venta) : null;
    m.ventaFormaPago = row.venta_forma_pago;
    m.ventaNumeroCuotas = row.venta_numero_cuotas;
    m.ventaCuotasPagadas = row.venta_cuotas_pagadas;
    m.gananciaNeta = row.ganancia_neta != null ? Number(row.ganancia_neta) : null;
    m.buyerName = row.buyer_name;
    m.buyerRut = row.buyer_rut;
    m.buyerContact = row.buyer_contact;
    m.meetingPlace = row.meeting_place;
    m.buyerPaymentMethod = row.buyer_payment_method;
    m.sellerName = row.seller_name;
    m.sellerRut = row.seller_rut;
    m.sellerContact = row.seller_contact;
    m.purchaseMeetingPlace = row.purchase_meeting_place;
  }
  if (table === "movimientos") {
    m.equipoId = row.equipo_id;
  }
  if (table === "pagos") {
    m.equipoId = row.equipo_id;
  }
  return m;
}

// Insert into SQLite
for (const row of proveedores) {
  const r = mapRow(row, "proveedores");
  db.insert(proveedoresTable).values({
    nombre: r.nombre, telefono: r.telefono, facebook: r.facebook,
    rut: r.rut, usuarioMercadolibre: r.usuario_mercadolibre,
    email: r.email, direccion: r.direccion, comentarios: r.comentarios,
  });
}
console.log(`Inserted ${proveedores.length} proveedores`);

for (const row of equipos) {
  const r = mapRow(row, "equipos");
  db.insert(equiposTable).values({
    categoria: r.categoria, equipo: r.equipo, marca: r.marca, modelo: r.modelo,
    bateriaPct: r.bateriaPct, imeiSerial: r.imeiSerial,
    estadoEquipoCondicion: r.estadoEquipoCondicion, estado: r.estado,
    fechaCompra: r.fechaCompra, proveedorId: r.proveedorId,
    formaPagoCompra: r.formaPagoCompra, precioCompra: r.precioCompra,
    gastosExtra: r.gastosExtra, costoTotal: r.costoTotal,
    fechaVenta: r.fechaVenta, plataformaVenta: r.plataformaVenta,
    precioVenta: r.precioVenta, ventaFormaPago: r.ventaFormaPago,
    ventaNumeroCuotas: r.ventaNumeroCuotas, ventaCuotasPagadas: r.ventaCuotasPagadas,
    gananciaNeta: r.gananciaNeta,
    buyerName: r.buyerName, buyerRut: r.buyerRut, buyerContact: r.buyerContact,
    meetingPlace: r.meetingPlace, buyerPaymentMethod: r.buyerPaymentMethod,
    sellerName: r.sellerName, sellerRut: r.sellerRut, sellerContact: r.sellerContact,
    purchaseMeetingPlace: r.purchaseMeetingPlace,
    comentarios: r.comentarios,
  });
}
console.log(`Inserted ${equipos.length} equipos`);

for (const row of movimientos) {
  const r = mapRow(row, "movimientos");
  db.insert(movimientosCajaTable).values({
    tipo: r.tipo, monto: Number(r.monto), motivo: r.motivo,
    fecha: r.fecha, equipoId: r.equipoId,
  });
}

for (const row of pagos) {
  const r = mapRow(row, "pagos");
  db.insert(pagosCuotasTable).values({
    equipoId: r.equipoId, monto: Number(r.monto), fecha: r.fecha,
  });
}

persist();
console.log("Migration complete! DB saved to data/techstock.db");
await neon.end();
