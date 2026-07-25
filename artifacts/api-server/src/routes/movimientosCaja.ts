import { Router } from "express";
import { desc, eq } from "drizzle-orm";
import { db, movimientosCajaTable } from "@workspace/db";
import {
  CreateMovimientoCajaBody,
  ListMovimientosCajaResponse,
  DeleteMovimientoCajaParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";
import { toDateOnlyString } from "../lib/dates";

const router = Router();

router.use(requireAuth);

router.get("/movimientos-caja", async (_req, res): Promise<void> => {
  const movimientos = await db
    .select()
    .from(movimientosCajaTable)
    .orderBy(desc(movimientosCajaTable.fecha), desc(movimientosCajaTable.id));
  res.json(
    ListMovimientosCajaResponse.parse(
      movimientos.map((m) => ({ ...m, monto: Number(m.monto) })),
    ),
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
      monto: String(parsed.data.monto),
      motivo: parsed.data.motivo,
      fecha: toDateOnlyString(parsed.data.fecha),
    })
    .returning();

  res.status(201).json({ ...movimiento, monto: Number(movimiento.monto) });
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
