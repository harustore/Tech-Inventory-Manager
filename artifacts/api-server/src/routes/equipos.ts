import { Router, type IRouter } from "express";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db, equiposTable, movimientosCajaTable, proveedoresTable } from "@workspace/db";
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
  ActualizarCuotasPagadasParams,
  ActualizarCuotasPagadasBody,
  ActualizarCuotasPagadasResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";
import { toDateOnlyString } from "../lib/dates";

const router: IRouter = Router();

router.use(requireAuth);

/** Drizzle returns `numeric` columns as strings; coerce them back to numbers for the API response. */
function normalizeEquipo<
  T extends {
    precioCompra: string;
    gastosExtra: string;
    costoTotal: string;
    precioVenta: string | null;
    gananciaNeta: string | null;
  },
>(equipo: T) {
  return {
    ...equipo,
    precioCompra: Number(equipo.precioCompra),
    gastosExtra: Number(equipo.gastosExtra),
    costoTotal: Number(equipo.costoTotal),
    precioVenta: equipo.precioVenta === null ? null : Number(equipo.precioVenta),
    gananciaNeta: equipo.gananciaNeta === null ? null : Number(equipo.gananciaNeta),
  };
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
    ventaCuotasPagadas: equiposTable.ventaCuotasPagadas,
    gananciaNeta: equiposTable.gananciaNeta,
    comentarios: equiposTable.comentarios,
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
        ilike(equiposTable.equipo, term),
        ilike(equiposTable.marca, term),
        ilike(equiposTable.modelo, term),
        ilike(equiposTable.imeiSerial, term),
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
        precioCompra: String(precioCompra),
        gastosExtra: String(gastosExtra),
        costoTotal: String(costoTotal),
        comentarios: parsed.data.comentarios,
      })
      .returning();

    await tx.insert(movimientosCajaTable).values({
      tipo: "egreso",
      monto: String(costoTotal),
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

  const [equipo] = await db
    .update(equiposTable)
    .set({
      ...parsed.data,
      fechaCompra: parsed.data.fechaCompra
        ? toDateOnlyString(parsed.data.fechaCompra)
        : undefined,
      precioCompra: parsed.data.precioCompra !== undefined ? String(precioCompra) : undefined,
      gastosExtra: parsed.data.gastosExtra !== undefined ? String(gastosExtra) : undefined,
      costoTotal: String(costoTotal),
    })
    .where(eq(equiposTable.id, params.data.id))
    .returning();

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
        precioVenta: String(parsed.data.precioVenta),
        ventaFormaPago,
        ventaNumeroCuotas: ventaFormaPago === "Cuotas" ? parsed.data.ventaNumeroCuotas : null,
        ventaCuotasPagadas: ventaFormaPago === "Cuotas" ? 0 : null,
        gananciaNeta: String(gananciaNeta),
      })
      .where(eq(equiposTable.id, params.data.id))
      .returning();

    await tx.insert(movimientosCajaTable).values({
      tipo: "ingreso",
      monto: String(parsed.data.precioVenta),
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

router.patch("/equipos/:id/cuotas-pagadas", async (req, res): Promise<void> => {
  const params = ActualizarCuotasPagadasParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = ActualizarCuotasPagadasBody.safeParse(req.body);
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
    parsed.data.ventaCuotasPagadas > existing.ventaNumeroCuotas
  ) {
    res.status(400).json({
      error: `ventaCuotasPagadas no puede ser mayor a ventaNumeroCuotas (${existing.ventaNumeroCuotas})`,
    });
    return;
  }

  const [equipo] = await db
    .update(equiposTable)
    .set({ ventaCuotasPagadas: parsed.data.ventaCuotasPagadas })
    .where(eq(equiposTable.id, params.data.id))
    .returning();

  const [proveedorNombre] = equipo.proveedorId
    ? await db
        .select({ nombre: proveedoresTable.nombre })
        .from(proveedoresTable)
        .where(eq(proveedoresTable.id, equipo.proveedorId))
    : [];

  res.json(
    ActualizarCuotasPagadasResponse.parse({
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
