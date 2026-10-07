import express from "express";
import { conn } from './dbconnect';

export const app = express();

app.get("/", (req, res) => {
  res.send("Hello World!!!");
});

app.get("/con", async (req, res) => {
  try {
const [rows]: any = await conn.query('SELECT NOW() AS databasetime');
res.json({ success: true, message: 'เชื่อมต่อ MySQL สำเร็จ', databaseTime: rows[0] });

  } catch (error) {
    res.status(500).json({ success: false, message: 'เชื่อมต่อ MySQL ไม่สำเร็จ'});
  }
});
