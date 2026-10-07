import { Router } from "express";

import { gettest, getcon } from "../controller/test/get.test"; 

const router = Router();

router.get("/", gettest);
router.get("/con", getcon);

export default router; 
