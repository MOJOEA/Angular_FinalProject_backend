import { Request, Response } from "express";
import { createOrder, getOrderById } from "../Service/order.service";
import { getOrder } from "../Service/order.service";
import { resetAndCreateTestOrders } from "../Service/order.service";
import { updateOrderBoxCount } from "../Service/order.service"; 
import { deleteOrderById } from "../Service/order.service";
import { clearAllOrders } from "../Service/order.service";

export const ControllerGetOrderId = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id < 1) {
    res.status(400).json({ success: false, message: "id ไม่ถูกต้อง" });
    return;
  }

  try {
    const order = await getOrderById(id);

    if (!order) {
      res.status(404).json({ success: false, message: "ไม่พบออเดอร์" });
      return;
    }

    res.json({ success: true, order });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      success: false,
      message: "ดึงข้อมูลออเดอร์ไม่สำเร็จ",
      error: errorMessage,
    });
  }
};

export const ControllerGetOrder = async (req: Request, res: Response) => {
  const { limit: rawLimit, lat: rawLat, lng: rawLng } = req.query;

  if (
    (rawLimit !== undefined && typeof rawLimit !== "string") ||
    (rawLat !== undefined && typeof rawLat !== "string") ||
    (rawLng !== undefined && typeof rawLng !== "string")
  ) {
    res.status(400).json({
      success: false,
      message: "ค่า query ต้องระบุอย่างละหนึ่งค่า",
    });
    return;
  }

  const limit = rawLimit === undefined ? undefined : Number(rawLimit);
  const lat = rawLat === undefined ? undefined : Number(rawLat);
  const lng = rawLng === undefined ? undefined : Number(rawLng);

  if (
    limit !== undefined &&
    (!Number.isSafeInteger(limit) || limit < 1)
  ) {
    res.status(400).json({
      success: false,
      message: "limit ต้องเป็นจำนวนเต็มบวก",
    });
    return;
  }

  if ((lat === undefined) !== (lng === undefined)) {
    res.status(400).json({
      success: false,
      message: "ต้องส่ง lat และ lng มาคู่กัน",
    });
    return;
  }

  if (
    (lat !== undefined && (!Number.isFinite(lat) || lat < -90 || lat > 90)) ||
    (lng !== undefined && (!Number.isFinite(lng) || lng < -180 || lng > 180))
  ) {
    res.status(400).json({
      success: false,
      message: "พิกัด lat/lng ไม่ถูกต้อง",
    });
    return;
  }

  try {
    const orders = await getOrder(limit, lat, lng);
    res.json({ success: true, orders });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      success: false,
      message: "ดึงรายการออเดอร์ไม่สำเร็จ",
      error: message,
    });
  }
};

export const ControllerCreateOrder = async (req: Request, res: Response) => {
  const { customer_id, box_count, order_note } = req.body ?? {};

  if (
    !Number.isSafeInteger(customer_id) ||
    customer_id < 1 ||
    !Number.isSafeInteger(box_count) ||
    box_count < 1 ||
    (order_note !== undefined && typeof order_note !== "string")
  ) {
    res.status(400).json({
      success: false,
      message: "กรุณาส่ง customer_id และ box_count เป็นจำนวนเต็มบวก",
    });
    return;
  }

  try {
    const orderId = await createOrder(customer_id, box_count, order_note);
    res.status(201).json({ success: true, order_id: orderId });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      success: false,
      message: "สร้างออเดอร์ไม่สำเร็จ",
      error: message,
    });
  }
};

export const ControllerCreateTestOrders = async (
  _req: Request,
  res: Response
) => {
  try {
    const orderIds = await resetAndCreateTestOrders();

    res.status(201).json({
      success: true,
      count: orderIds.length,
      order_ids: orderIds,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    res.status(500).json({
      success: false,
      message: "สร้างออเดอร์ทดสอบไม่สำเร็จ",
      error: message,
    });
  }
};

export const ControllerUpdateOrder = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { box_count } = req.body ?? {};

  if (!Number.isSafeInteger(id) || id < 1) {
    res.status(400).json({ success: false, message: "id ไม่ถูกต้อง" });
    return;
  }
  
  if (!Number.isSafeInteger(box_count) || box_count < 1 || box_count > 3) {
    res.status(400).json({
      success: false,
      message: "box_count ต้องเป็นจำนวนเต็มตั้งแต่ 1 ถึง 3",
    });
    return;
  }

  try {
    const found = await updateOrderBoxCount(id, box_count);

    if (!found) {
      res.status(404).json({ success: false, message: "ไม่พบออเดอร์" });
      return;
    }

    res.json({ success: true, message: "แก้ไขจำนวนกล่องแล้ว" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      success: false,
      message: "แก้ไขออเดอร์ไม่สำเร็จ",
      error: message,
    });
  }
};

export const ControllerDeleteOrder = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id < 1) {
    res.status(400).json({ success: false, message: "id ไม่ถูกต้อง" });
    return;
  }

  try {
    const deleted = await deleteOrderById(id);

    if (!deleted) {
      res.status(404).json({ success: false, message: "ไม่พบออเดอร์" });
      return;
    }

    res.json({ success: true, message: "ลบออเดอร์แล้ว" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      success: false,
      message: "ลบออเดอร์ไม่สำเร็จ",
      error: message,
    });
  }
};

export const ControllerClearOrders = async (_req: Request, res: Response) => {
  try {
    const deletedCount = await clearAllOrders();

    res.json({
      success: true,
      message: "ลบออเดอร์ทั้งหมดแล้ว",
      deleted_count: deletedCount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(500).json({
      success: false,
      message: "ลบออเดอร์ทั้งหมดไม่สำเร็จ",
      error: message,
    });
  }
};