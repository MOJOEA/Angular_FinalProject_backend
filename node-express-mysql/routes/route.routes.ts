import { Router } from "express";

import { ControllerGetRoutes, ControllerGetRoutesById, ControllerGetRouteByWorkId } from "../controller/route.controller"; 

const router = Router();

router.get("/", ControllerGetRoutes);

router.get("/:id", ControllerGetRoutesById);

router.get("/work/:id", ControllerGetRouteByWorkId);

export default router; 
