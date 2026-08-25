import { Router } from "express";
import { db, equiposTable, pagosCuotasTable, movimientosCajaTable, and, desc, eq, gte, sql } from "@workspace/db";
import {
  GetResumenCapitalResponse,
  GetRecomendacionesResponse,
  GetDeudoresResponse,
} from "@workspace/api-zod";
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

  const cajaActual = Number(caja.ingresos) - Number(caja.egresos);

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

router.get("/analytics/deudores", async (_req, res): Promise<void> => {
  try {
    const equiposEnCuotas = await db
      .select({
        equipoId: equiposTable.id,
        equipo: equiposTable.equipo,
        marca: equiposTable.marca,
        modelo: equiposTable.modelo,
        buyerName: equiposTable.buyerName,
        buyerRut: equiposTable.buyerRut,
        buyerContact: equiposTable.buyerContact,
        fechaVenta: equiposTable.fechaVenta,
        precioVenta: equiposTable.precioVenta,
        ventaNumeroCuotas: equiposTable.ventaNumeroCuotas,
        ventaCuotasPagadas: equiposTable.ventaCuotasPagadas,
      })
      .from(equiposTable)
      .where(
        and(
          eq(equiposTable.estado, "vendido"),
          eq(equiposTable.ventaFormaPago, "Cuotas"),
        ),
      )
      .orderBy(desc(equiposTable.fechaVenta), desc(equiposTable.id));

    const pagosPorEquipo = await db
      .select({
        equipoId: pagosCuotasTable.equipoId,
        total_pagado: sql<number>`coalesce(sum(${pagosCuotasTable.monto}), 0)`.as("total_pagado"),
      })
      .from(pagosCuotasTable)
      .groupBy(pagosCuotasTable.equipoId);

    const totalPagadoPorEquipo = new Map(
      pagosPorEquipo.map((row) => [row.equipoId, Number(row.total_pagado)]),
    );

    const deudores = equiposEnCuotas
      .map((row) => {
        const precioVenta = Number(row.precioVenta);
        const totalPagado = totalPagadoPorEquipo.get(row.equipoId) ?? 0;
        const cuotasPendientes = Math.max(
          0,
          (row.ventaNumeroCuotas ?? 0) - (row.ventaCuotasPagadas ?? 0),
        );
        return {
          equipoId: row.equipoId,
          equipo: row.equipo,
          marca: row.marca,
          modelo: row.modelo,
          buyerName: row.buyerName,
          buyerRut: row.buyerRut,
          buyerContact: row.buyerContact,
          fechaVenta: row.fechaVenta,
          precioVenta,
          ventaNumeroCuotas: row.ventaNumeroCuotas ?? 0,
          ventaCuotasPagadas: row.ventaCuotasPagadas ?? 0,
          cuotasPendientes,
          totalPagado,
          saldoPendiente: Math.max(0, precioVenta - totalPagado),
        };
      })
      .filter((d) => d.saldoPendiente > 0);

    const totalDeuda = deudores.reduce((sum, d) => sum + d.saldoPendiente, 0);

    res.json(
      GetDeudoresResponse.parse({
        totalDeuda,
        cantidadDeudores: deudores.length,
        deudores,
      }),
    );
  } catch (error) {
    console.error("Error in GET /analytics/deudores", error);
    res.status(500).json({ error: "No se pudieron cargar los deudores" });
  }
});

const radarSources = [
  { name: "Celulares usados", url: "https://listado.mercadolibre.cl/celulares-telefonia/celulares-smartphones/usado/celular_OrderId_PRICE_PublishedToday_YES_NoIndex_True" },
  { name: "Tablets usadas", url: "https://listado.mercadolibre.cl/computacion/tablets-accesorios/tablets/usado/tablets_OrderId_PRICE_PublishedToday_YES_NoIndex_True" },
  { name: "Notebooks usadas", url: "https://listado.mercadolibre.cl/computacion/notebooks-accesorios/notebooks/usado/notebooks_OrderId_PRICE_PublishedToday_YES_NoIndex_True" },
  { name: "Consolas usadas", url: "https://listado.mercadolibre.cl/consolas-videojuegos/consolas/usado/_OrderId_PRICE_PublishedToday_YES_NoIndex_True" },
  { name: "Smartwatches usados", url: "https://listado.mercadolibre.cl/celulares-telefonia/smartwatches-accesoriossmartwatch/usado/_OrderId_PRICE_PublishedToday_YES_NoIndex_True" },
  { name: "Audífonos usados", url: "https://listado.mercadolibre.cl/electronica-audio-video/audio/audifonos/usado/_PublishedToday_YES" },
  { name: "RTX y GTX usadas", url: "https://listado.mercadolibre.cl/rtx_PublishedToday_YES_ITEM*CONDITION_2230581_NoIndex_True" },
  { name: "Televisores usados", url: "https://listado.mercadolibre.cl/electronica-audio-video/televisores/usado/televisores_OrderId_PRICE_PublishedToday_YES_NoIndex_True" },
  { name: "TV Box usados", url: "https://listado.mercadolibre.cl/tv-box_PublishedToday_YES_ITEM*CONDITION_2230581_NoIndex_True" },
  { name: "Apple usado", url: "https://listado.mercadolibre.cl/apple_PublishedToday_YES_ITEM*CONDITION_2230581_NoIndex_True" },
];

router.get("/analytics/mercadolibre-radar", async (_req, res): Promise<void> => {
  const results = await Promise.all(radarSources.map(async (source) => {
    try {
      const response = await fetch(source.url, { headers: { "User-Agent": "Mozilla/5.0" } });
      const html = await response.text();
      const prices = [...html.matchAll(/andes-money-amount__fraction[^>]*>([\d.]+)/g)]
        .map((match) => Number(match[1].replace(/\./g, "")))
        .filter((price) => price > 0);
      const averagePrice = prices.length ? prices.reduce((sum, price) => sum + price, 0) / prices.length : 0;
      return { ...source, status: response.ok ? "ok" : "error", listings: prices.length, averagePrice: Math.round(averagePrice), minPrice: prices.length ? Math.min(...prices) : 0, maxPrice: prices.length ? Math.max(...prices) : 0 };
    } catch {
      return { ...source, status: "error", listings: 0, averagePrice: 0, minPrice: 0, maxPrice: 0 };
    }
  }));
  res.json({ currency: "CLP", collectedAt: new Date().toISOString(), sources: results });
});

export default router;
