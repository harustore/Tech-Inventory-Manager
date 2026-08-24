import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workbookPath = process.argv[2] ?? path.resolve(rootDir, "C:/Users/Zamix/Downloads/INVENTARIO HARUSTORE (1).xlsx");
const envPath = path.resolve(rootDir, "artifacts/api-server/.env");

function readEnvFile(envFilePath) {
  return fs.readFile(envFilePath, "utf8");
}

function parseEnvValue(content, key) {
  const match = content.match(new RegExp(`^${key}=(.+)$`, "m"));
  if (!match) {
    throw new Error(`${key} not found in ${content}`);
  }
  return match[1].trim().replace(/\s+/g, "");
}

function normalizeText(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).replace(/\s+/g, " ").trim();
  return text.length ? text : null;
}

function normalizeCategory(value) {
  const text = normalizeText(value);
  if (!text) return "Otro";
  const lower = text.toLowerCase();
  if (lower.includes("smartphone") || lower.includes("celular") || lower.includes("phone")) return "Celular";
  if (lower.includes("notebook") || lower.includes("laptop")) return "Notebook";
  if (lower.includes("computador") || lower.includes("pc")) return "PC Escritorio";
  if (lower.includes("smartwatch") || lower.includes("reloj")) return "Smartwatch";
  if (lower.includes("consola")) return "Consola";
  if (lower.includes("tv")) return "TV";
  if (lower.includes("audif")) return "Audifonos";
  if (lower.includes("box")) return "TV Box";
  if (lower.includes("tablet")) return "Otro";
  return "Otro";
}

function normalizeCondition(value) {
  const text = normalizeText(value);
  if (!text) return "Usado - Bueno";
  const lower = text.toLowerCase();
  if (lower.includes("nuevo") || lower.includes("como nuevo")) return "Usado - Excelente";
  if (lower.includes("falla") || lower.includes("falla")) return "Usado - Regular";
  if (lower.includes("repuesto")) return "Para repuestos";
  if (lower.includes("regular") || lower.includes("malo")) return "Usado - Regular";
  return "Usado - Bueno";
}

function normalizePayment(value) {
  const text = normalizeText(value);
  if (!text) return "Otro";
  const lower = text.toLowerCase();
  if (lower.includes("transfer")) return "Transferencia";
  if (lower.includes("efect")) return "Efectivo";
  if (lower.includes("tarjet")) return "Tarjeta";
  if (lower.includes("mercado")) return "Otro";
  return "Otro";
}

function normalizeBattery(value) {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  if (Number.isNaN(num)) return null;
  if (num > 0 && num <= 1) return Math.round(num * 100);
  return Math.round(num);
}

function sanitizeDate(value) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  const text = String(value).trim();
  if (!text) return null;
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

function pythonExtractJson(workbookFile) {
  const python = "C:\\Users\\Zamix\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe";
  const script = `
import json, sys, openpyxl
path = sys.argv[1]
wb = openpyxl.load_workbook(path, data_only=True)
reg = next(ws for ws in wb.worksheets if 'Registro' in ws.title)
cap = next(ws for ws in wb.worksheets if 'Capital' in ws.title)
records = []
for row in reg.iter_rows(min_row=4, values_only=True):
    if not row or len(row) < 4 or not row[3]:
        continue
    records.append({
        'id': row[0],
        'categoria': row[1],
        'fechaCompra': row[2],
        'equipo': row[3],
        'marca': row[4],
        'modelo': row[5],
        'bateria': row[6],
        'imeiSerial': row[7],
        'estadoEquipo': row[8],
        'proveedor': row[9],
        'formaPagoCompra': row[10],
        'precioCompra': row[11],
        'gastosExtra': row[12],
        'costoTotal': row[13],
        'fechaVenta': row[14],
        'plataformaVenta': row[15],
        'precioVenta': row[16],
        'gananciaNeta': row[17],
        'comentarios': row[18],
    })\n\ncapital = cap['B5'].value if cap['B5'].value is not None else 0\ninitial_balance = cap['B19'].value if cap['B19'].value is not None else 0\nprint(json.dumps({'records': records, 'capital': capital, 'initial_balance': initial_balance}, default=str, ensure_ascii=False))\n`;
  const result = spawnSync(python, ["-c", script, workbookFile], { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || "Failed to extract workbook");
  }
  return JSON.parse(result.stdout);
}

const envContent = await readEnvFile(envPath);
const databaseUrl = parseEnvValue(envContent, "DATABASE_URL");
const extracted = pythonExtractJson(workbookPath);
const records = extracted.records;
const capitalInicial = Number(extracted.capital ?? 0);
const saldoDisponibleObjetivo = Number(extracted.initial_balance ?? 0);

const providers = new Map();
for (const record of records) {
  const providerName = normalizeText(record.proveedor);
  if (providerName) providers.set(providerName, providerName);
}

const { Pool } = pg;
const pool = new Pool({ connectionString: databaseUrl });

const money = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
};

async function main() {
  await pool.query("BEGIN");
  try {
    await pool.query("TRUNCATE TABLE pagos_cuotas, movimientos_caja, equipos, proveedores RESTART IDENTITY CASCADE");

    const providerIds = new Map();
    for (const name of providers.keys()) {
      const result = await pool.query(
        "INSERT INTO proveedores (nombre) VALUES ($1) RETURNING id",
        [name],
      );
      providerIds.set(name, result.rows[0].id);
    }

    const initialDate = sanitizeDate(records.find((r) => r.fechaCompra)?.fechaCompra) ?? new Date().toISOString().slice(0, 10);
    if (capitalInicial > 0) {
      await pool.query(
        `INSERT INTO movimientos_caja (tipo, monto, motivo, fecha)
         VALUES ('ingreso', $1, 'Capital inicial importado desde Excel', $2)`,
        [capitalInicial, initialDate],
      );
    }

    for (const record of records) {
      const categoria = normalizeCategory(record.categoria);
      const estadoEquipoCondicion = normalizeCondition(record.estadoEquipo);
      const fechaCompra = sanitizeDate(record.fechaCompra);
      const fechaVenta = sanitizeDate(record.fechaVenta);
      const proveedorNombre = normalizeText(record.proveedor);
      const proveedorId = proveedorNombre ? providerIds.get(proveedorNombre) ?? null : null;
      const bateriaPct = normalizeBattery(record.bateria);
      const precioCompra = money(record.precioCompra) ?? 0;
      const gastosExtra = money(record.gastosExtra) ?? 0;
      const costoTotal = money(record.costoTotal) ?? precioCompra + gastosExtra;
      const precioVenta = money(record.precioVenta);
      const gananciaNeta = money(record.gananciaNeta);
      const estado = fechaVenta && precioVenta !== null ? "vendido" : "en_stock";
      const ventaFormaPago = fechaVenta && precioVenta !== null ? "Contado" : null;
      const ventaNumeroCuotas = null;
      const ventaCuotasPagadas = null;

      const inserted = await pool.query(
        `INSERT INTO equipos (
          categoria, equipo, marca, modelo, bateria_pct, imei_serial, estado_equipo_condicion,
          estado, fecha_compra, proveedor_id, forma_pago_compra, precio_compra, gastos_extra,
          costo_total, fecha_venta, plataforma_venta, precio_venta, venta_forma_pago,
          venta_numero_cuotas, venta_cuotas_pagadas, ganancia_neta, comentarios
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22
        ) RETURNING id`,
        [
          categoria,
          normalizeText(record.equipo),
          normalizeText(record.marca),
          normalizeText(record.modelo),
          bateriaPct,
          normalizeText(record.imeiSerial),
          estadoEquipoCondicion,
          estado,
          fechaCompra,
          proveedorId,
          normalizePayment(record.formaPagoCompra),
          precioCompra,
          gastosExtra,
          costoTotal,
          fechaVenta,
          normalizeText(record.plataformaVenta),
          precioVenta,
          ventaFormaPago,
          ventaNumeroCuotas,
          ventaCuotasPagadas,
          gananciaNeta,
          normalizeText(record.comentarios),
        ],
      );

      const equipoId = inserted.rows[0].id;

      await pool.query(
        `INSERT INTO movimientos_caja (tipo, monto, motivo, fecha, equipo_id)
         VALUES ('egreso', $1, $2, $3, $4)`,
        [costoTotal, `Compra: ${normalizeText(record.marca) ?? ""} ${normalizeText(record.modelo) ?? ""}`.trim(), fechaCompra, equipoId],
      );

      if (fechaVenta && precioVenta !== null) {
        await pool.query(
          `INSERT INTO movimientos_caja (tipo, monto, motivo, fecha, equipo_id)
           VALUES ('ingreso', $1, $2, $3, $4)`,
          [precioVenta, `Venta: ${normalizeText(record.marca) ?? ""} ${normalizeText(record.modelo) ?? ""}`.trim(), fechaVenta, equipoId],
        );
      }
    }

    await pool.query("COMMIT");
    console.log(JSON.stringify({
      importedProviders: providers.size,
      importedEquipos: records.length,
      capitalInicial,
      saldoDisponibleObjetivo,
      message: "Import completed",
    }, null, 2));
  } catch (error) {
    await pool.query("ROLLBACK");
    throw error;
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
