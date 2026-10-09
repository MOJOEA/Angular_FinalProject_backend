import { Router } from "express";
import * as ctrl from "../controller/order.controller";

const router = Router();

router.get("/", ctrl.getOrders); 
router.get("/:id", ctrl.getOrder);

router.post("/", ctrl.postOrder);
router.post("/test", ctrl.postOrderTest);

router.put("/:id", ctrl.putOrder);

router.delete("/clear", ctrl.deleteOrderClear);
router.delete("/:id", ctrl.deleteOrder);

export default router;
