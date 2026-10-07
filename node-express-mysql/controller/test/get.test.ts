import express, { Request, Response } from "express";
import { conn } from '../../dbconnect';

export const gettest = async (req: Request, res: Response) => {
    res.send("Hello World!!!");
}

export const getcon = async (req: Request, res: Response) => {
    try {
        const [rows]: any = await conn.query('SELECT NOW() AS databasetime');
        res.json({ success: true, message: 'เชื่อมต่อ MySQL สำเร็จ', databaseTime: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'เชื่อมต่อ MySQL ไม่สำเร็จ', error: error });
    }
}
