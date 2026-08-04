import { Router } from "express";
import { db, equiposTable, movimientosCajaTable, proveedoresTable, pagosCuotasTable, and, desc, eq, or, sql } from "@workspace/db";
import {
  ListEquiposQueryParams,
  ListEquiposResponse,
  CreateEquipoBody,
  GetEquipoResponse,
  GetEquipoParams,
  UpdateEquipoParams,
  UpdateEquipoBody,
  UpdateEquipoResponse,
  DeleteEquipoParams,
  RegistrarVentaEquipoParams,
  RegistrarVentaEquipoBody,
  RegistrarVentaEquipoResponse,
  ReactivarEquipoParams,
  ReactivarEquipoResponse,
  ListPagosCuotasParams,
  ListPagosCuotasResponse,
  RegistrarPagoCuotaParams,
  RegistrarPagoCuotaBody,
  RegistrarPagoCuotaResponse,
  EliminarPagoCuotaParams,
  EliminarPagoCuotaResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth.js";
import { toDateOnlyString } from "../lib/dates.js";

const router = Router();

router.use(requireAuth);

/** pg columns (numeric/date) are mapped by @workspace/db to numbers/strings; identity transform for API response. */
function normalizeEquipo<T>(equipo: T) {
  return equipo;
}

function equipoWithProveedorSelection() {
  return {
    id: equiposTable.id,
    categoria: equiposTable.categoria,
    equipo: equiposTable.equipo,
    marca: equiposTable.marca,
    modelo: equiposTable.modelo,
    bateriaPct: equiposTable.bateriaPct,
    imeiSerial: equiposTable.imeiSerial,
    estadoEquipoCondicion: equiposTable.estadoEquipoCondicion,
    estado: equiposTable.estado,
    fechaCompra: equiposTable.fechaCompra,
    proveedorId: equiposTable.proveedorId,
    proveedorNombre: proveedoresTable.nombre,
    formaPagoCompra: equiposTable.formaPagoCompra,
    precioCompra: equiposTable.precioCompra,
    gastosExtra: equiposTable.gastosExtra,
    costoTotal: equiposTable.costoTotal,
    fechaVenta: equiposTable.fechaVenta,
    plataformaVenta: equiposTable.plataformaVenta,
    precioVenta: equiposTable.precioVenta,
    ventaFormaPago: equiposTable.ventaFormaPago,
    ventaNumeroCuotas: equiposTable.ventaNumeroCuotas,
    ventaCuotasPagadas: equiposTable.ventaCuotasPagadas,
    gananciaNeta: equiposTable.gananciaNeta,
    comentarios: equiposTable.comentarios,
    sellerName: equiposTable.sellerName,
    sellerRut: equiposTable.sellerRut,
    sellerContact: equiposTable.sellerContact,
    purchaseMeetingPlace: equiposTable.purchaseMeetingPlace,
    createdAt: equiposTable.createdAt,
    updatedAt: equiposTable.updatedAt,
  };
}

router.get("/equipos", async (req, res): Promise<void> => {
  const query = ListEquiposQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const conditions = [];
  if (query.data.estado) {
    conditions.push(eq(equiposTable.estado, query.data.estado));
  }
  if (query.data.categoria) {
    conditions.push(eq(equiposTable.categoria, query.data.categoria));
  }
  if (query.data.search) {
    const term = `%${query.data.search}%`;
      conditions.push(
        or(
          sql`${equiposTable.equipo} ILIKE ${term}`,
          sql`${equiposTable.marca} ILIKE ${term}`,
          sql`${equiposTable.modelo} ILIKE ${term}`,
          sql`${equiposTable.imeiSerial} ILIKE ${term}`,
        ),
      );
  }

  const equipos = await db
    .select(equipoWithProveedorSelection())
    .from(equiposTable)
    .leftJoin(proveedoresTable, eq(equiposTable.proveedorId, proveedoresTable.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(equiposTable.fechaCompra), desc(equiposTable.id));

  res.json(ListEquiposResponse.parse(equipos.map(normalizeEquipo)));
});

router.post("/equipos", async (req, res): Promise<void> => {
  const parsed = CreateEquipoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const precioCompra = parsed.data.precioCompra;
  const gastosExtra = parsed.data.gastosExtra;
  const costoTotal = precioCompra + gastosExtra;
  const fechaCompra = toDateOnlyString(parsed.data.fechaCompra);

  const [equipo] = await db.transaction(async (tx) => {
    const inserted = await tx
      .insert(equiposTable)
      .values({
        categoria: parsed.data.categoria,
        equipo: parsed.data.equipo,
        marca: parsed.data.marca,
        modelo: parsed.data.modelo,
        bateriaPct: parsed.data.bateriaPct,
        imeiSerial: parsed.data.imeiSerial,
        estadoEquipoCondicion: parsed.data.estadoEquipoCondicion,
        estado: "en_stock",
        fechaCompra,
        proveedorId: parsed.data.proveedorId,
        formaPagoCompra: parsed.data.formaPagoCompra,
        precioCompra,
        gastosExtra,
        costoTotal,
        comentarios: parsed.data.comentarios,
        sellerName: parsed.data.sellerName,
        sellerRut: parsed.data.sellerRut,
        sellerContact: parsed.data.sellerContact,
        purchaseMeetingPlace: parsed.data.purchaseMeetingPlace,
      })
      .returning();

    await tx.insert(movimientosCajaTable).values({
      tipo: "egreso",
      monto: costoTotal,
      motivo: `Compra: ${parsed.data.marca} ${parsed.data.modelo}`,
      fecha: fechaCompra,
      equipoId: inserted[0].id,
    });

    return inserted;
  });

  const [proveedorNombre] = equipo.proveedorId
    ? await db
        .select({ nombre: proveedoresTable.nombre })
        .from(proveedoresTable)
        .where(eq(proveedoresTable.id, equipo.proveedorId))
    : [];

  res.status(201).json(
    GetEquipoResponse.parse({
      ...normalizeEquipo(equipo),
      proveedorNombre: proveedorNombre?.nombre ?? null,
    }),
  );
});

router.get("/equipos/:id", async (req, res): Promise<void> => {
  const params = GetEquipoParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [equipo] = await db
    .select(equipoWithProveedorSelection())
    .from(equiposTable)
    .leftJoin(proveedoresTable, eq(equiposTable.proveedorId, proveedoresTable.id))
    .where(eq(equiposTable.id, params.data.id));

  if (!equipo) {
    res.status(404).json({ error: "Equipo not found" });
    return;
  }

  res.json(GetEquipoResponse.parse(normalizeEquipo(equipo)));
});

router.patch("/equipos/:id", async (req, res): Promise<void> => {
  const params = UpdateEquipoParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateEquipoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(equiposTable)
    .where(eq(equiposTable.id, params.data.id));

  if (!existing) {
    res.status(404).json({ error: "Equipo not found" });
    return;
  }

  const precioCompra = parsed.data.precioCompra ?? Number(existing.precioCompra);
  const gastosExtra = parsed.data.gastosExtra ?? Number(existing.gastosExtra);
  const costoTotal = precioCompra + gastosExtra;

  const saleFields: Record<string, unknown> = {};
  const hasSaleFields =
    parsed.data.fechaVenta !== undefined ||
    parsed.data.plataformaVenta !== undefined ||
    parsed.data.precioVenta !== undefined ||
    parsed.data.ventaFormaPago !== undefined ||
    parsed.data.ventaNumeroCuotas !== undefined;

  if (hasSaleFields && existing.estado !== "vendido") {
    res.status(400).json({ error: "El equipo no está vendido, no se pueden editar datos de venta" });
    return;
  }

  const oldPrecioVenta = Number(existing.precioVenta);
  const oldFechaVenta = existing.fechaVenta;

  if (hasSaleFields) {
    const newPrecioVenta =
      parsed.data.precioVenta !== undefined ? parsed.data.precioVenta : oldPrecioVenta;
    const newVentaFormaPago =
      parsed.data.ventaFormaPago !== undefined ? parsed.data.ventaFormaPago : existing.ventaFormaPago;
    const newVentaNumeroCuotas =
      parsed.data.ventaNumeroCuotas !== undefined ? parsed.data.ventaNumeroCuotas : existing.ventaNumeroCuotas;
    const newFechaVenta = parsed.data.fechaVenta !== undefined
      ? (parsed.data.fechaVenta ? toDateOnlyString(parsed.data.fechaVenta) : null)
      : oldFechaVenta;
    const gananciaNeta = newPrecioVenta !== null ? newPrecioVenta - costoTotal : null;

    saleFields.fechaVenta = newFechaVenta;
    saleFields.plataformaVenta = parsed.data.plataformaVenta !== undefined
      ? parsed.data.plataformaVenta
      : undefined;
    saleFields.precioVenta = newPrecioVenta;
    saleFields.ventaFormaPago = newVentaFormaPago;
    saleFields.ventaNumeroCuotas = newVentaNumeroCuotas;
    saleFields.gananciaNeta = gananciaNeta;

    if (newVentaFormaPago === "Contado" || newVentaFormaPago === null) {
      saleFields.ventaCuotasPagadas = null;
      if (parsed.data.ventaNumeroCuotas === undefined) {
        saleFields.ventaNumeroCuotas = null;
      }
    } else if (newVentaFormaPago === "Cuotas" && existing.ventaFormaPago !== "Cuotas") {
      saleFields.ventaCuotasPagadas = 0;
    }
  }

  const { fechaVenta: _fechaVenta, ...restData } = parsed.data;

  const [equipo] = await db.transaction(async (tx) => {
    const updated = await tx
      .update(equiposTable)
      .set({
        ...restData,
        fechaCompra: parsed.data.fechaCompra
          ? toDateOnlyString(parsed.data.fechaCompra)
          : undefined,
        precioCompra: parsed.data.precioCompra !== undefined ? precioCompra : undefined,
        gastosExtra: parsed.data.gastosExtra !== undefined ? gastosExtra : undefined,
        costoTotal,
        ...saleFields,
      })
      .where(eq(equiposTable.id, params.data.id))
      .returning();

    if (hasSaleFields) {
      const newPrecioVenta =
        parsed.data.precioVenta !== undefined ? parsed.data.precioVenta : oldPrecioVenta;
      const newFechaVenta = parsed.data.fechaVenta !== undefined
        ? (parsed.data.fechaVenta ? toDateOnlyString(parsed.data.fechaVenta) : null)
        : oldFechaVenta;

      const cashChanged = newPrecioVenta !== oldPrecioVenta || newFechaVenta !== oldFechaVenta;
      if (cashChanged && newPrecioVenta !== null && newFechaVenta !== null) {
        await tx
          .update(movimientosCajaTable)
          .set({
            monto: newPrecioVenta,
            fecha: newFechaVenta,
            motivo: `Venta: ${existing.marca} ${existing.modelo}`,
          })
          .where(
            and(
              eq(movimientosCajaTable.equipoId, params.data.id),
              eq(movimientosCajaTable.tipo, "ingreso"),
            ),
          );
      }

      const newFormaPago =
        parsed.data.ventaFormaPago !== undefined ? parsed.data.ventaFormaPago : existing.ventaFormaPago;
      const oldFormaPago = existing.ventaFormaPago;

      if (oldFormaPago !== newFormaPago && oldFormaPago === "Cuotas") {
        await tx
          .delete(pagosCuotasTable)
          .where(eq(pagosCuotasTable.equipoId, params.data.id));
      }
    }

    return updated;
  });

  const [proveedorNombre] = equipo.proveedorId
    ? await db
        .select({ nombre: proveedoresTable.nombre })
        .from(proveedoresTable)
        .where(eq(proveedoresTable.id, equipo.proveedorId))
    : [];

  res.json(
    UpdateEquipoResponse.parse({
      ...normalizeEquipo(equipo),
      proveedorNombre: proveedorNombre?.nombre ?? null,
    }),
  );
});

router.delete("/equipos/:id", async (req, res): Promise<void> => {
  const params = DeleteEquipoParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [equipo] = await db
    .delete(equiposTable)
    .where(eq(equiposTable.id, params.data.id))
    .returning();

  if (!equipo) {
    res.status(404).json({ error: "Equipo not found" });
    return;
  }

  res.sendStatus(204);
});

router.patch("/equipos/:id/venta", async (req, res): Promise<void> => {
  const params = RegistrarVentaEquipoParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = RegistrarVentaEquipoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(equiposTable)
    .where(eq(equiposTable.id, params.data.id));

  if (!existing) {
    res.status(404).json({ error: "Equipo not found" });
    return;
  }

  if (existing.estado === "vendido") {
    res.status(400).json({ error: "El equipo ya fue vendido" });
    return;
  }

  const ventaFormaPago = parsed.data.ventaFormaPago ?? "Contado";
  if (ventaFormaPago === "Cuotas" && !parsed.data.ventaNumeroCuotas) {
    res.status(400).json({ error: "ventaNumeroCuotas es requerido cuando la venta es en cuotas" });
    return;
  }

  const fechaVenta = toDateOnlyString(parsed.data.fechaVenta);
  const costoTotal = Number(existing.costoTotal);
  const gananciaNeta = parsed.data.precioVenta - costoTotal;

  const [equipo] = await db.transaction(async (tx) => {
    const updated = await tx
      .update(equiposTable)
      .set({
        estado: "vendido",
        fechaVenta,
        plataformaVenta: parsed.data.plataformaVenta,
        precioVenta: parsed.data.precioVenta,
        ventaFormaPago,
        ventaNumeroCuotas: ventaFormaPago === "Cuotas" ? parsed.data.ventaNumeroCuotas : null,
        ventaCuotasPagadas: ventaFormaPago === "Cuotas" ? 0 : null,
        gananciaNeta,
        buyerName: parsed.data.buyerName ?? null,
        buyerRut: parsed.data.buyerRut ?? null,
        buyerContact: parsed.data.buyerContact ?? null,
        meetingPlace: parsed.data.meetingPlace ?? null,
        buyerPaymentMethod: parsed.data.buyerPaymentMethod ?? null,
      })
      .where(eq(equiposTable.id, params.data.id))
      .returning();

    await tx.insert(movimientosCajaTable).values({
      tipo: "ingreso",
      monto: parsed.data.precioVenta,
      motivo: `Venta: ${existing.marca} ${existing.modelo}`,
      fecha: fechaVenta,
      equipoId: updated[0].id,
    });

    return updated;
  });

  const [proveedorNombre] = equipo.proveedorId
    ? await db
        .select({ nombre: proveedoresTable.nombre })
        .from(proveedoresTable)
        .where(eq(proveedoresTable.id, equipo.proveedorId))
    : [];

  res.json(
    RegistrarVentaEquipoResponse.parse({
      ...normalizeEquipo(equipo),
      proveedorNombre: proveedorNombre?.nombre ?? null,
    }),
  );
});

router.get("/equipos/:id/pagos-cuotas", async (req, res): Promise<void> => {
  const params = ListPagosCuotasParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(equiposTable)
    .where(eq(equiposTable.id, params.data.id));

  if (!existing) {
    res.status(404).json({ error: "Equipo not found" });
    return;
  }

  const pagos = await db
    .select()
    .from(pagosCuotasTable)
    .where(eq(pagosCuotasTable.equipoId, params.data.id))
    .orderBy(pagosCuotasTable.fecha, pagosCuotasTable.id);

  res.json(
    ListPagosCuotasResponse.parse(
      pagos.map((pago) => ({ ...pago, monto: Number(pago.monto) })),
    ),
  );
});

router.post("/equipos/:id/pagos-cuotas", async (req, res): Promise<void> => {
  const params = RegistrarPagoCuotaParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = RegistrarPagoCuotaBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(equiposTable)
    .where(eq(equiposTable.id, params.data.id));

  if (!existing) {
    res.status(404).json({ error: "Equipo not found" });
    return;
  }

  if (existing.estado !== "vendido" || existing.ventaFormaPago !== "Cuotas") {
    res.status(400).json({ error: "El equipo no fue vendido en cuotas" });
    return;
  }

  if (
    existing.ventaNumeroCuotas !== null &&
    (existing.ventaCuotasPagadas ?? 0) >= existing.ventaNumeroCuotas
  ) {
    res.status(400).json({ error: "Ya se registraron todas las cuotas" });
    return;
  }

  const [pagosResumen] = await db
    .select({ total: sql<number>`coalesce(sum(${pagosCuotasTable.monto}), 0)` })
    .from(pagosCuotasTable)
    .where(eq(pagosCuotasTable.equipoId, params.data.id));
  const saldoPendiente = Math.max(
    0,
    Number(existing.precioVenta ?? 0) - Number(pagosResumen?.total ?? 0),
  );
  if (parsed.data.monto > saldoPendiente) {
    res.status(400).json({ error: "El pago no puede superar el saldo pendiente" });
    return;
  }

  const fecha = toDateOnlyString(parsed.data.fecha);

  const [equipo] = await db.transaction(async (tx) => {
    await tx.insert(pagosCuotasTable).values({
      equipoId: params.data.id,
      monto: parsed.data.monto,
      fecha,
    });

    const updated = await tx
      .update(equiposTable)
      .set({ ventaCuotasPagadas: (existing.ventaCuotasPagadas ?? 0) + 1 })
      .where(eq(equiposTable.id, params.data.id))
      .returning();

    return updated;
  });

  const [proveedorNombre] = equipo.proveedorId
    ? await db
        .select({ nombre: proveedoresTable.nombre })
        .from(proveedoresTable)
        .where(eq(proveedoresTable.id, equipo.proveedorId))
    : [];

  res.status(201).json(
    RegistrarPagoCuotaResponse.parse({
      ...normalizeEquipo(equipo),
      proveedorNombre: proveedorNombre?.nombre ?? null,
    }),
  );
});

router.delete("/pagos-cuotas/:id", async (req, res): Promise<void> => {
  const params = EliminarPagoCuotaParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [pago] = await db
    .delete(pagosCuotasTable)
    .where(eq(pagosCuotasTable.id, params.data.id))
    .returning();

  if (!pago) {
    res.status(404).json({ error: "Pago not found" });
    return;
  }

  const [existing] = await db
    .select()
    .from(equiposTable)
    .where(eq(equiposTable.id, pago.equipoId));

  if (!existing) {
    res.status(404).json({ error: "Equipo not found" });
    return;
  }

  const [equipo] = await db
    .update(equiposTable)
    .set({ ventaCuotasPagadas: Math.max(0, (existing.ventaCuotasPagadas ?? 0) - 1) })
    .where(eq(equiposTable.id, pago.equipoId))
    .returning();

  const [proveedorNombre] = equipo.proveedorId
    ? await db
        .select({ nombre: proveedoresTable.nombre })
        .from(proveedoresTable)
        .where(eq(proveedoresTable.id, equipo.proveedorId))
    : [];

  res.json(
    EliminarPagoCuotaResponse.parse({
      ...normalizeEquipo(equipo),
      proveedorNombre: proveedorNombre?.nombre ?? null,
    }),
  );
});

router.patch("/equipos/:id/reactivar", async (req, res): Promise<void> => {
  const params = ReactivarEquipoParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(equiposTable)
    .where(eq(equiposTable.id, params.data.id));

  if (!existing) {
    res.status(404).json({ error: "Equipo not found" });
    return;
  }

  if (existing.estado !== "vendido") {
    res.status(400).json({ error: "El equipo no está vendido" });
    return;
  }

  const [equipo] = await db.transaction(async (tx) => {
    const updated = await tx
      .update(equiposTable)
      .set({
        estado: "en_stock",
        fechaVenta: null,
        plataformaVenta: null,
        precioVenta: null,
        ventaFormaPago: null,
        ventaNumeroCuotas: null,
        ventaCuotasPagadas: null,
        gananciaNeta: null,
      })
      .where(eq(equiposTable.id, params.data.id))
      .returning();

    // Remove the cash-ledger entry created by the sale being undone.
    await tx
      .delete(movimientosCajaTable)
      .where(
        and(
          eq(movimientosCajaTable.equipoId, params.data.id),
          eq(movimientosCajaTable.tipo, "ingreso"),
        ),
      );

    // Remove any installment payments recorded for the sale being undone.
    await tx
      .delete(pagosCuotasTable)
      .where(eq(pagosCuotasTable.equipoId, params.data.id));

    return updated;
  });

  const [proveedorNombre] = equipo.proveedorId
    ? await db
        .select({ nombre: proveedoresTable.nombre })
        .from(proveedoresTable)
        .where(eq(proveedoresTable.id, equipo.proveedorId))
    : [];

  res.json(
    ReactivarEquipoResponse.parse({
      ...normalizeEquipo(equipo),
      proveedorNombre: proveedorNombre?.nombre ?? null,
    }),
  );
});

export default router;
