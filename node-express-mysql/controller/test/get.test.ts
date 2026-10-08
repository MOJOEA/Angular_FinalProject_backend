import express, { Request, Response } from "express";
import { conn } from '../../dbconnect';

export const gettest = async (req: Request, res: Response) => {
    res.send("Hello World!!!");
}

export const getcon = async (req: Request, res: Response) => {
    try {
        // เปลี่ยนคำสั่ง SQL เป็น DATABASE()
        const [rows]: any = await conn.query('SELECT DATABASE() AS databaseName, NOW() AS databasetime');
        res.json({ 
            success: true, 
            message: 'เชื่อมต่อ MySQL สำเร็จ', 
            databaseName: rows[0].databaseName,
            databaseTime: rows[0].databasetime 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'เชื่อมต่อ MySQL ไม่สำเร็จ', error: error });
    }
}

