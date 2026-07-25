import { Router } from "express";
import healthRouter from "./health.js";
import proveedoresRouter from "./proveedores.js";
import equiposRouter from "./equipos.js";
import movimientosCajaRouter from "./movimientosCaja.js";
import analyticsRouter from "./analytics.js";

const router = Router();

router.use(healthRouter);
router.use(proveedoresRouter);
router.use(equiposRouter);
router.use(movimientosCajaRouter);
router.use(analyticsRouter);

export default router;
