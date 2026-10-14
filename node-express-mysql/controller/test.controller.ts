import { Request, Response } from "express";
import { getCon } from "../Service/test.service";

import { WorkOrderService } from "../Service/creatework/creatework.service";

export const ControllerCreatework = async (req: Request, res: Response) => {
    try {
        const workOrderService = new WorkOrderService();
        const result = await workOrderService.generateWorkOrders();
        res.json({ success: true, message: 'สร้างใบสั่งงานและบันทึกข้อมูลเรียบร้อยแล้ว' });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการสร้างใบสั่งงาน', error: errorMessage });
    }
}



export const ControllerGetTest = async (req: Request, res: Response) => {
    res.send("Hello World!!!");
}

export const ControllerGetCon = async (req: Request, res: Response) => {
    try {
        const result = await getCon();
        res.json({ success: true, setting: result});
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ success: false, message: 'เชื่อมต่อ MySQL ไม่สำเร็จ', error: errorMessage });
    }
}

