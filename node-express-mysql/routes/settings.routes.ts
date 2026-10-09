import { Router } from "express";

import { ControllerGetSetting, ControllerPutSetting } from "../controller/settings.controller"; 

const router = Router();

router.get("/", ControllerGetSetting);

router.put("/", ControllerPutSetting);

export default router; 
