import { Router } from "express";

import { ControllerGetTest, ControllerGetCon, ControllerCreatework } from "../controller/test.controller"; 
const router = Router();

router.get("/", ControllerGetTest);
router.get("/con", ControllerGetCon);
router.get("/work/creat", ControllerCreatework);

export default router; 
