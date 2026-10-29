import { Request, Response } from "express";

import { clearAllRouteStops } from "../../Service/route.service";
import { createWorkService } from "../../Service/work.service";
import { WorkOrderService } from "../../Service/creatework/creatework.service";
import * as workService from '../../Service/work.service';

// GET api/work/create
export const ControllerCreatework = async (req: Request, res: Response) => {
    try {
        const workOrderService = new WorkOrderService();
        await createWorkService();
        await clearAllRouteStops();
        await workOrderService.generateWorkOrders();
        const data = await workService.getAllWorksService();
        res.status(200).json({ success: true, data });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการสร้างใบสั่งงาน', error: errorMessage });
    }
}