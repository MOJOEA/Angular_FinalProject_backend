import express, { Request, Response } from "express";
import { getSetting } from "../Service/setting.service";


export const ControllerGetSetting = async (req: Request, res: Response) => {
    try {
        const result = await getSetting();
        res.json({ success: true, setting: result});
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ success: false, message: 'เชื่อมต่อ MySQL ไม่สำเร็จ', error: errorMessage });
    }
}
