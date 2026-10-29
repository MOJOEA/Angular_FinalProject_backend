import { Router } from "express";
import { ControllerClearOrders, ControllerCreateOrder, ControllerCreateTestOrders, ControllerDeleteOrder, ControllerGetOrder, ControllerGetOrderId, ControllerUpdateOrder, ControllerUpdateOrderSuccess } from "../controller/order.controller";
    

const router = Router();

router.get("/", ControllerGetOrder);

router.get("/:id", ControllerGetOrderId);

router.post("/", ControllerCreateOrder);

router.post("/test", ControllerCreateTestOrders);

router.put("/:id", ControllerUpdateOrder);

router.put("/success/:id", ControllerUpdateOrderSuccess);

router.delete("/clear", ControllerClearOrders);

router.delete("/:id", ControllerDeleteOrder);

export default router;

