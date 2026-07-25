import { Router } from "express";
import { db, proveedoresTable, eq } from "@workspace/db";
import {
  CreateProveedorBody,
  ListProveedoresResponse,
  GetProveedorParams,
  GetProveedorResponse,
  UpdateProveedorParams,
  UpdateProveedorBody,
  UpdateProveedorResponse,
  DeleteProveedorParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.use(requireAuth);

router.get("/proveedores", async (_req, res): Promise<void> => {
  const proveedores = await db
    .select()
    .from(proveedoresTable)
    .orderBy(proveedoresTable.nombre);
  res.json(ListProveedoresResponse.parse(proveedores));
});

router.post("/proveedores", async (req, res): Promise<void> => {
  const parsed = CreateProveedorBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [proveedor] = await db
    .insert(proveedoresTable)
    .values(parsed.data as Required<typeof parsed.data>)
    .returning();

  res.status(201).json(GetProveedorResponse.parse(proveedor));
});

router.get("/proveedores/:id", async (req, res): Promise<void> => {
  const params = GetProveedorParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [proveedor] = await db
    .select()
    .from(proveedoresTable)
    .where(eq(proveedoresTable.id, params.data.id));

  if (!proveedor) {
    res.status(404).json({ error: "Proveedor not found" });
    return;
  }

  res.json(GetProveedorResponse.parse(proveedor));
});

router.patch("/proveedores/:id", async (req, res): Promise<void> => {
  const params = UpdateProveedorParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateProveedorBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [proveedor] = await db
    .update(proveedoresTable)
    .set(parsed.data)
    .where(eq(proveedoresTable.id, params.data.id))
    .returning();

  if (!proveedor) {
    res.status(404).json({ error: "Proveedor not found" });
    return;
  }

  res.json(UpdateProveedorResponse.parse(proveedor));
});

router.delete("/proveedores/:id", async (req, res): Promise<void> => {
  const params = DeleteProveedorParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [proveedor] = await db
    .delete(proveedoresTable)
    .where(eq(proveedoresTable.id, params.data.id))
    .returning();

  if (!proveedor) {
    res.status(404).json({ error: "Proveedor not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
