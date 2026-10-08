import express, { Request, Response } from "express";
import { getCon } from "../Service/test.service";

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
