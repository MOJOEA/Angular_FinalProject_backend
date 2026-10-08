import { Router } from "express";

import { ControllerGetTest, ControllerGetCon } from "../controller/test.controller"; 

const router = Router();

router.get("/", ControllerGetTest);
router.get("/con", ControllerGetCon);

export default router; 
