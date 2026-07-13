import { Router, type IRouter } from "express";
import healthRouter from "./health";
import proveedoresRouter from "./proveedores";
import equiposRouter from "./equipos";
import movimientosCajaRouter from "./movimientosCaja";
import analyticsRouter from "./analytics";

const router: IRouter = Router();

router.use(healthRouter);
router.use(proveedoresRouter);
router.use(equiposRouter);
router.use(movimientosCajaRouter);
router.use(analyticsRouter);

export default router;
