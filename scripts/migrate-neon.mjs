import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  db,
  persist,
  proveedoresTable,
  equiposTable,
  movimientosCajaTable,
  pagosCuotasTable,
  sql,
} from "@workspace/db";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL env var required (postgres://user:pass@host/db)");
  process.exit(1);
}

const host = DATABASE_URL.replace(/^postgres:\/\//, "").split("@")[1].split("/")[0];
const url = `https://${host}/sql`;

async function selectRows(queryText) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", "neon-connection-string": DATABASE_URL },
    body: JSON.stringify({ query: queryText }),
  });
  const data = await res.json();
  if (!res.ok || (data && data.message && data.rows === undefined)) {
    throw new Error(`Neon query failed: ${data?.message ?? `HTTP ${res.status}`}`);
  }
  return data.rows ?? [];
}

const COLS = {
  proveedores: [
    ["id", "id", true], ["nombre", "nombre"], ["telefono", "telefono"], ["facebook", "facebook"],
    ["rut", "rut"], ["usuario_mercadolibre", "usuarioMercadolibre"], ["email", "email"],
    ["direccion", "direccion"], ["comentarios", "comentarios"], ["created_at", "createdAt"],
  ],
  equipos: [
    ["id", "id", true], ["categoria", "categoria"], ["equipo", "equipo"], ["marca", "marca"],
    ["modelo", "modelo"], ["bateria_pct", "bateriaPct", true], ["imei_serial", "imeiSerial"],
    ["estado_equipo_condicion", "estadoEquipoCondicion"], ["estado", "estado"],
    ["fecha_compra", "fechaCompra"], ["proveedor_id", "proveedorId", true],
    ["forma_pago_compra", "formaPagoCompra"], ["precio_compra", "precioCompra", true],
    ["gastos_extra", "gastosExtra", true], ["costo_total", "costoTotal", true],
    ["fecha_venta", "fechaVenta"], ["plataforma_venta", "plataformaVenta"],
    ["precio_venta", "precioVenta", true], ["venta_forma_pago", "ventaFormaPago"],
    ["venta_numero_cuotas", "ventaNumeroCuotas", true],
    ["venta_cuotas_pagadas", "ventaCuotasPagadas", true],
    ["ganancia_neta", "gananciaNeta", true],
    ["buyer_name", "buyerName"], ["buyer_rut", "buyerRut"], ["buyer_contact", "buyerContact"],
    ["meeting_place", "meetingPlace"], ["buyer_payment_method", "buyerPaymentMethod"],
    ["seller_name", "sellerName"], ["seller_rut", "sellerRut"], ["seller_contact", "sellerContact"],
    ["purchase_meeting_place", "purchaseMeetingPlace"], ["comentarios", "comentarios"],
    ["created_at", "createdAt"], ["updated_at", "updatedAt"],
  ],
  movimientos_caja: [
    ["id", "id", true], ["tipo", "tipo"], ["monto", "monto", true], ["motivo", "motivo"],
    ["fecha", "fecha"], ["equipo_id", "equipoId", true], ["created_at", "createdAt"],
  ],
  pagos_cuotas: [
    ["id", "id", true], ["equipo_id", "equipoId", true], ["monto", "monto", true],
    ["fecha", "fecha"], ["created_at", "createdAt"],
  ],
};

function buildValues(row, cols) {
  const v = {};
  for (const [snake, camel, isNum] of cols) {
    if (!(snake in row)) continue;
    let val = row[snake] ?? null;
    if (isNum && val !== null) val = Number(val);
    v[camel] = val;
  }
  return v;
}

console.log(`Reading data from Neon (${url})...`);
const [proveedoresRows, equiposRows, movRows, pagosRows] = await Promise.all([
  selectRows("SELECT * FROM proveedores"),
  selectRows("SELECT * FROM equipos"),
  selectRows("SELECT * FROM movimientos_caja"),
  selectRows("SELECT * FROM pagos_cuotas"),
]);
console.log(
  `Neon: ${proveedoresRows.length} proveedores, ${equiposRows.length} equipos, ${movRows.length} movimientos, ${pagosRows.length} pagos`,
);

const DB_PATH = join(process.cwd(), "data", "techstock.db");
const backupPath = `${DB_PATH}.bak`;
if (existsSync(DB_PATH)) {
  copyFileSync(DB_PATH, backupPath);
  console.log(`Backup created: ${backupPath}`);
}

await db.transaction((tx) => {
  tx.run(sql`DELETE FROM pagos_cuotas`);
  tx.run(sql`DELETE FROM movimientos_caja`);
  tx.run(sql`DELETE FROM equipos`);
  tx.run(sql`DELETE FROM proveedores`);
  tx.run(
    sql`DELETE FROM sqlite_sequence WHERE name IN ('proveedores','equipos','movimientos_caja','pagos_cuotas')`,
  );

  for (const row of proveedoresRows) {
    tx.insert(proveedoresTable).values(buildValues(row, COLS.proveedores)).run();
  }
  for (const row of equiposRows) {
    tx.insert(equiposTable).values(buildValues(row, COLS.equipos)).run();
  }
  for (const row of movRows) {
    tx.insert(movimientosCajaTable).values(buildValues(row, COLS.movimientos_caja)).run();
  }
  for (const row of pagosRows) {
    tx.insert(pagosCuotasTable).values(buildValues(row, COLS.pagos_cuotas)).run();
  }
});

persist();
console.log(
  `Migration complete! ${proveedoresRows.length} proveedores, ${equiposRows.length} equipos, ${movRows.length} movimientos, ${pagosRows.length} pagos -> ${DB_PATH}`,
);
