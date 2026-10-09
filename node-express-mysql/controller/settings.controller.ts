import { Request, Response } from "express";
import { getSetting, updateSettings } from "../Service/setting.service";
import { Settings } from '../Model/Settings.model';


export const ControllerGetSetting = async (req: Request, res: Response) => {
    try {
        const settings: Settings = await getSetting();
        res.json({ success: true, data: settings});
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        res.status(500).json({ success: false, message: 'เชื่อมต่อ MySQL ไม่สำเร็จ', error: errorMessage });
    }
}

export const ControllerPutSetting = async (req: Request, res: Response) => {
    try {
        const settingsData = req.body as Settings;
        const targetId = 1; 
        const isSuccess = await updateSettings(targetId, settingsData);
        if (!isSuccess) {
            return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลตั้งค่าระบบที่ต้องการแก้ไข' });
        }
        const updatedSettings = await getSetting();
        return res.json({ success: true, data: updatedSettings });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return res.status(500).json({ success: false, message: 'อัปเดตการตั้งค่าระบบไม่สำเร็จ', error: errorMessage });
    }
};


