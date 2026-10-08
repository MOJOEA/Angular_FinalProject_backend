import { Router } from "express";

import { ControllerGetSetting } from "../controller/settings.controller"; 

const router = Router();

router.get("/", ControllerGetSetting);

export default router; 
