import { Router } from "express";
import { ControllerClearOrders, ControllerCreateOrder, ControllerCreateTestOrders, ControllerDeleteOrder, ControllerGetOrder, ControllerGetOrderId, ControllerUpdateOrder } from "../controller/order.controller";
    

const router = Router();

router.get("/", ControllerGetOrder);

router.get("/:id", ControllerGetOrderId);

router.post("/", ControllerCreateOrder);

router.post("/test", ControllerCreateTestOrders);

router.put("/:id", ControllerUpdateOrder);

router.delete("/clear", ControllerClearOrders);

router.delete("/:id", ControllerDeleteOrder);

export default router;

