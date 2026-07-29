import { Router } from "express";
import { db, equiposTable, movimientosCajaTable, and, eq, gte, sql } from "@workspace/db";
import { GetResumenCapitalResponse, GetRecomendacionesResponse } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

router.use(requireAuth);

router.get("/analytics/resumen", async (_req, res): Promise<void> => {
  const [caja] = await db
    .select({
      ingresos: sql<number>`coalesce(sum(case when ${movimientosCajaTable.tipo} in ('ingreso', 'ajuste') then ${movimientosCajaTable.monto} else 0 end), 0)`,
      egresos: sql<number>`coalesce(sum(case when ${movimientosCajaTable.tipo} = 'egreso' then ${movimientosCajaTable.monto} else 0 end), 0)`,
    })
    .from(movimientosCajaTable);

  const cajaActual = caja.ingresos - caja.egresos;

  const [inventario] = await db
    .select({
      valorInventario: sql<number>`coalesce(sum(case when ${equiposTable.estado} in ('en_stock', 'reservado') then ${equiposTable.costoTotal} else 0 end), 0)`,
      itemsEnStock: sql<number>`coalesce(sum(case when ${equiposTable.estado} = 'en_stock' then 1 else 0 end), 0)`,
      itemsReservados: sql<number>`coalesce(sum(case when ${equiposTable.estado} = 'reservado' then 1 else 0 end), 0)`,
      itemsVendidos: sql<number>`coalesce(sum(case when ${equiposTable.estado} = 'vendido' then 1 else 0 end), 0)`,
    })
    .from(equiposTable);

  const [ventas] = await db
    .select({
      gananciaTotalHistorica: sql<number>`coalesce(sum(${equiposTable.gananciaNeta}), 0)`,
    })
    .from(equiposTable)
    .where(eq(equiposTable.estado, "vendido"));

  const treintaDiasAtras = new Date();
  treintaDiasAtras.setDate(treintaDiasAtras.getDate() - 30);
  const treintaDiasStr = treintaDiasAtras.toISOString().slice(0, 10);

  const [ventasMes] = await db
    .select({
      total: sql<number>`count(*)`,
      ganancia: sql<number>`coalesce(sum(${equiposTable.gananciaNeta}), 0)`,
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
      valorInventario: inventario.valorInventario,
      capitalTotal: cajaActual + inventario.valorInventario,
      gananciaTotalHistorica: ventas.gananciaTotalHistorica,
      gananciaMes: ventasMes.ganancia,
      itemsEnStock: inventario.itemsEnStock,
      itemsReservados: inventario.itemsReservados,
      itemsVendidos: inventario.itemsVendidos,
      ventasUltimos30Dias: ventasMes.total,
      comprasUltimos30Dias: comprasMes.total,
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
      avgCostoCompra: sql<number>`avg(${equiposTable.costoTotal})`,
      avgPrecioVenta: sql<number>`avg(${equiposTable.precioVenta})`,
      avgGananciaNeta: sql<number>`avg(${equiposTable.gananciaNeta})`,
    })
    .from(equiposTable)
    .where(eq(equiposTable.estado, "vendido"))
    .groupBy(equiposTable.categoria, equiposTable.marca, equiposTable.modelo)
    .orderBy(sql`avg(${equiposTable.gananciaNeta}) desc`);

  const recomendaciones = rows.map((row) => {
    const avgCostoCompra = row.avgCostoCompra;
    const avgPrecioVenta = row.avgPrecioVenta;
    const avgGananciaNeta = row.avgGananciaNeta;
    const margenPromedioPct =
      avgPrecioVenta > 0 ? (avgGananciaNeta / avgPrecioVenta) * 100 : 0;
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
      unidadesVendidas: row.unidadesVendidas,
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
