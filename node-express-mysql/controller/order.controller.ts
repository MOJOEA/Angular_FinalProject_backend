import { Request, Response } from "express";
import * as db from "../Service/order.service";

export const getOrders = async (req: Request, res: Response) => {
  try {
    const { limit, lat, lng } = req.query;
    const filters: db.OrderFilterInput = {};

    if (limit) {
      const parsedLimit = parseInt(limit as string, 10);
      if (!isNaN(parsedLimit)) filters.limit = parsedLimit;
    }

    if (lat && lng) {
      const parsedLat = parseFloat(lat as string);
      const parsedLng = parseFloat(lng as string);
      if (isNaN(parsedLat) || isNaN(parsedLng)) {
        return res.status(400).json({ success: false, message: "พิกัด lat หรือ lng ทศนิยมไม่ถูกต้อง" });
      }
      filters.lat = parsedLat;
      filters.lng = parsedLng;
    }

    const orders = await db.getOrdersWithFilters(filters);
    return res.json({ success: true, total: orders.length, data: orders });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const getOrder = async (req: Request, res: Response) => {
  try {
    const order = await db.getOrderById(parseInt(req.params.id as string, 10));
    if (!order) return res.status(404).json({ success: false, message: "ไม่พบคำสั่งซื้อ" });
    return res.json({ success: true, data: order });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const postOrder = async (req: Request, res: Response) => {
  try {
    const currentOrders = await db.getOrdersWithFilters({});
    if (currentOrders.length >= 30) {
      return res.status(400).json({ 
        success: false, 
        message: `ไม่สามารถสร้างคำสั่งซื้อเพิ่มได้ เนื่องจากระบบจำกัดจำนวนคำสั่งซื้อไว้สูงสุดไม่เกิน 30 รายการ (ปัจจุบันมี ${currentOrders.length} รายการ)` 
      });
    }

    await db.createOrder(req.body);
    return res.status(201).json({ success: true, message: "สร้างคำสั่งซื้อสำเร็จ" });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const postOrderTest = async (req: Request, res: Response) => {
  try {
    await db.clearAllOrders();
    const customerIds = await db.getAllCustomerIds();

    if (customerIds.length === 0) {
      return res.status(400).json({ success: false, message: "กรุณาสร้างข้อมูลลูกค้าก่อนรันสคริปต์จำลอง" });
    }

    const notes = ["ขอช้อนส้อมเพิ่มด้วยครับ", "ส่งที่ป้อมยาม", "ไม่เอาผัก", "เผ็ดน้อย", "ฝากไว้ใต้ตึก", ""];
    for (let i = 0; i < 25; i++) {
      const mockOrder: any = {
        customer_id: customerIds[Math.floor(Math.random() * customerIds.length)],
        box_count: Math.floor(Math.random() * 5) + 1,
        order_note: notes[Math.floor(Math.random() * notes.length)]
      };
      await db.createOrder(mockOrder);
    }

    return res.status(201).json({ success: true, message: "จำลองข้อมูลคำสั่งซื้อใหม่ 25 รายการเรียบร้อย" });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const putOrder = async (req: Request, res: Response) => {
  try {
    const success = await db.updateOrder(parseInt(req.params.id as string, 10), req.body);
    if (!success) return res.status(404).json({ success: false, message: "ไม่พบคำสั่งซื้อที่ต้องการอัปเดต" });
    return res.json({ success: true, message: "อัปเดตคำสั่งซื้อสำเร็จ" });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const success = await db.deleteOrder(parseInt(req.params.id as string, 10));
    if (!success) return res.status(404).json({ success: false, message: "ไม่พบคำสั่งซื้อที่ต้องการลบ" });
    return res.json({ success: true, message: "ลบคำสั่งซื้อสำเร็จ" });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteOrderClear = async (req: Request, res: Response) => {
  try {
    await db.clearAllOrders();
    return res.json({ success: true, message: "ล้างรายการสั่งซื้อทั้งหมดเรียบร้อย" });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
