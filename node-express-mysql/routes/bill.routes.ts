import { Router } from "express";

import { getBill, getBills } from "../controller/bill/get.Bill"; 

const router = Router();

router.get("/", getBills);
router.get("/:id", getBill);


export default router; 
