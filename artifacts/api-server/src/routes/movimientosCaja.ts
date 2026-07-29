import { Router } from "express";
import { db, movimientosCajaTable, desc, eq } from "@workspace/db";
import {
  CreateMovimientoCajaBody,
  ListMovimientosCajaResponse,
  UpdateMovimientoCajaBody,
  UpdateMovimientoCajaParams,
  DeleteMovimientoCajaParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth.js";
import { toDateOnlyString } from "../lib/dates.js";

const router = Router();

router.use(requireAuth);

router.get("/movimientos-caja", async (_req, res): Promise<void> => {
  const movimientos = await db
    .select()
    .from(movimientosCajaTable)
    .orderBy(desc(movimientosCajaTable.fecha), desc(movimientosCajaTable.id));
  res.json(
    ListMovimientosCajaResponse.parse(movimientos),
  );
});

router.post("/movimientos-caja", async (req, res): Promise<void> => {
  const parsed = CreateMovimientoCajaBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [movimiento] = await db
    .insert(movimientosCajaTable)
    .values({
      tipo: parsed.data.tipo,
      monto: parsed.data.monto,
      motivo: parsed.data.motivo,
      fecha: toDateOnlyString(parsed.data.fecha),
    })
    .returning();

  res.status(201).json(movimiento);
});

router.patch("/movimientos-caja/:id", async (req, res): Promise<void> => {
  const params = UpdateMovimientoCajaParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateMovimientoCajaBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [movimiento] = await db
    .update(movimientosCajaTable)
    .set({
      ...parsed.data,
      fecha: parsed.data.fecha ? toDateOnlyString(parsed.data.fecha) : undefined,
    })
    .where(eq(movimientosCajaTable.id, params.data.id))
    .returning();

  if (!movimiento) {
    res.status(404).json({ error: "Movimiento not found" });
    return;
  }

  res.json(movimiento);
});

router.delete("/movimientos-caja/:id", async (req, res): Promise<void> => {
  const params = DeleteMovimientoCajaParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [movimiento] = await db
    .delete(movimientosCajaTable)
    .where(eq(movimientosCajaTable.id, params.data.id))
    .returning();

  if (!movimiento) {
    res.status(404).json({ error: "Movimiento not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
