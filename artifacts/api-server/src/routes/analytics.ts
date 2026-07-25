import { Router } from "express";
import { and, eq, gte, sql } from "drizzle-orm";
import { db, equiposTable, movimientosCajaTable } from "@workspace/db";
import { GetResumenCapitalResponse, GetRecomendacionesResponse } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.use(requireAuth);

router.get("/analytics/resumen", async (_req, res): Promise<void> => {
  const [caja] = await db
    .select({
      ingresos: sql<string>`coalesce(sum(case when ${movimientosCajaTable.tipo} in ('ingreso', 'ajuste') then ${movimientosCajaTable.monto} else 0 end), 0)`,
      egresos: sql<string>`coalesce(sum(case when ${movimientosCajaTable.tipo} = 'egreso' then ${movimientosCajaTable.monto} else 0 end), 0)`,
    })
    .from(movimientosCajaTable);

  const cajaActual = Number(caja.ingresos) - Number(caja.egresos);

  const [inventario] = await db
    .select({
      valorInventario: sql<string>`coalesce(sum(${equiposTable.costoTotal}), 0)`,
      itemsEnStock: sql<number>`count(*) filter (where ${equiposTable.estado} = 'en_stock')`,
      itemsReservados: sql<number>`count(*) filter (where ${equiposTable.estado} = 'reservado')`,
      itemsVendidos: sql<number>`count(*) filter (where ${equiposTable.estado} = 'vendido')`,
    })
    .from(equiposTable)
    .where(sql`${equiposTable.estado} in ('en_stock', 'reservado')`);

  const [ventas] = await db
    .select({
      gananciaTotalHistorica: sql<string>`coalesce(sum(${equiposTable.gananciaNeta}), 0)`,
    })
    .from(equiposTable)
    .where(eq(equiposTable.estado, "vendido"));

  const treintaDiasAtras = new Date();
  treintaDiasAtras.setDate(treintaDiasAtras.getDate() - 30);
  const treintaDiasStr = treintaDiasAtras.toISOString().slice(0, 10);

  const [ventasMes] = await db
    .select({
      total: sql<number>`count(*)`,
      ganancia: sql<string>`coalesce(sum(${equiposTable.gananciaNeta}), 0)`,
    })
    .from(equiposTable)
    .where(
      and(eq(equiposTable.estado, "vendido"), gte(equiposTable.fechaVenta, treintaDiasStr)),
    );

  const [comprasMes] = await db
    .select({ total: sql<number>`count(*)` })
    .from(equiposTable)
    .where(gte(equiposTable.fechaCompra, treintaDiasStr));

  res.json(
    GetResumenCapitalResponse.parse({
      cajaActual,
      valorInventario: Number(inventario.valorInventario),
      capitalTotal: cajaActual + Number(inventario.valorInventario),
      gananciaTotalHistorica: Number(ventas.gananciaTotalHistorica),
      gananciaMes: Number(ventasMes.ganancia),
      itemsEnStock: Number(inventario.itemsEnStock),
      itemsReservados: Number(inventario.itemsReservados),
      itemsVendidos: Number(inventario.itemsVendidos),
      ventasUltimos30Dias: Number(ventasMes.total),
      comprasUltimos30Dias: Number(comprasMes.total),
    }),
  );
});

router.get("/analytics/recomendaciones", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      categoria: equiposTable.categoria,
      marca: equiposTable.marca,
      modelo: equiposTable.modelo,
      unidadesVendidas: sql<number>`count(*)`,
      avgCostoCompra: sql<string>`avg(${equiposTable.costoTotal})`,
      avgPrecioVenta: sql<string>`avg(${equiposTable.precioVenta})`,
      avgGananciaNeta: sql<string>`avg(${equiposTable.gananciaNeta})`,
    })
    .from(equiposTable)
    .where(eq(equiposTable.estado, "vendido"))
    .groupBy(equiposTable.categoria, equiposTable.marca, equiposTable.modelo)
    .orderBy(sql`avg(${equiposTable.gananciaNeta}) desc`);

  const recomendaciones = rows.map((row) => {
    const avgCostoCompra = Number(row.avgCostoCompra);
    const avgPrecioVenta = Number(row.avgPrecioVenta);
    const avgGananciaNeta = Number(row.avgGananciaNeta);
    const margenPromedioPct =
      avgPrecioVenta > 0 ? (avgGananciaNeta / avgPrecioVenta) * 100 : 0;
    // Recommend paying at most 70% of the average sale price to preserve a healthy margin.
    const precioCompraRecomendado = avgPrecioVenta * 0.7;

    let recomendacion: string;
    if (row.unidadesVendidas < 2) {
      recomendacion = `Pocas ventas registradas (${row.unidadesVendidas}). Sigue observando antes de invertir fuerte en este modelo.`;
    } else if (margenPromedioPct >= 30) {
      recomendacion = `Buen margen (${margenPromedioPct.toFixed(1)}%). Vale la pena seguir comprando este modelo, pagando hasta ~$${precioCompraRecomendado.toFixed(0)}.`;
    } else if (margenPromedioPct >= 10) {
      recomendacion = `Margen ajustado (${margenPromedioPct.toFixed(1)}%). Compra solo si el precio es igual o menor a ~$${precioCompraRecomendado.toFixed(0)}.`;
    } else {
      recomendacion = `Margen bajo (${margenPromedioPct.toFixed(1)}%). Evita invertir en este modelo salvo que el precio de compra baje considerablemente.`;
    }

    return {
      categoria: row.categoria,
      marca: row.marca,
      modelo: row.modelo,
      unidadesVendidas: Number(row.unidadesVendidas),
      avgCostoCompra,
      avgPrecioVenta,
      avgGananciaNeta,
      margenPromedioPct,
      precioCompraRecomendado,
      recomendacion,
    };
  });

  res.json(GetRecomendacionesResponse.parse(recomendaciones));
});

export default router;
