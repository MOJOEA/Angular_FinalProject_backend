import { Request, Response } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { conn } from "../dbconnect";


export const getCustomers = async (req: Request, res: Response) => {
    try {
        const { name, limit, lat, lng } = req.query;

        // ตรวจสอบว่าระบุพิกัดมาครบทั้งสองค่าหรือไม่
        if ((lat !== undefined && lng === undefined) ||
            (lat === undefined && lng !== undefined)) {
            res.status(400).json({
                message: "กรุณาระบุทั้ง lat และ lng"
            });
            return;
        }

        // ค้นหาตามชื่อและพิกัดในระยะ 1 กิโลเมตร
        if (name !== undefined && lat !== undefined && lng !== undefined) {
            const latitude = Number(lat);
            const longitude = Number(lng);

            if (
                !Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
                !Number.isFinite(longitude) || longitude < -180 || longitude > 180
            ) {
                res.status(400).json({ message: "พิกัดไม่ถูกต้อง" });
                return;
            }

            const [customers] = await conn.execute<RowDataPacket[]>(
                `SELECT * FROM customer
                 WHERE customer_name LIKE ?
                 AND latitude IS NOT NULL
                 AND longitude IS NOT NULL
                 AND ST_Distance_Sphere(
                     POINT(longitude, latitude),
                     POINT(?, ?)
                 ) <= 1000`,
                [`%${String(name).trim()}%`, longitude, latitude]
            );

            res.json(customers);
            return;
        }

        // ค้นหาเฉพาะลูกค้าในระยะ 1 กิโลเมตร
        if (lat !== undefined && lng !== undefined) {
            const latitude = Number(lat);
            const longitude = Number(lng);

            if (
                !Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
                !Number.isFinite(longitude) || longitude < -180 || longitude > 180
            ) {
                res.status(400).json({ message: "พิกัดไม่ถูกต้อง" });
                return;
            }

            const [customers] = await conn.execute<RowDataPacket[]>(
                `SELECT * FROM customer
                 WHERE latitude IS NOT NULL
                 AND longitude IS NOT NULL
                 AND ST_Distance_Sphere(
                     POINT(longitude, latitude),
                     POINT(?, ?)
                 ) <= 1000`,
                [longitude, latitude]
            );

            res.json(customers);
            return;
        }

        // ค้นหาตามชื่อ
        if (name !== undefined) {
            const [customers] = await conn.execute<RowDataPacket[]>(
                "SELECT * FROM customer WHERE customer_name LIKE ?",
                [`%${String(name).trim()}%`]
            );

            res.json(customers);
            return;
        }

        // จำกัดจำนวนข้อมูล
        if (limit !== undefined) {
            const numberLimit = Number(limit);

            if (!Number.isSafeInteger(numberLimit) || numberLimit <= 0) {
                res.status(400).json({
                    message: "limit ต้องเป็นจำนวนเต็มบวก"
                });
                return;
            }

            const [customers] = await conn.execute<RowDataPacket[]>(
                "SELECT * FROM customer LIMIT ?",
                [numberLimit]
            );

            res.json(customers);
            return;
        }

        // ดึงข้อมูลลูกค้าทั้งหมด
        const [customers] = await conn.execute<RowDataPacket[]>(
            "SELECT * FROM customer"
        );

        res.json(customers);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "เกิดข้อผิดพลาดในการดึงข้อมูลลูกค้า"
        });
    }
};





export const getCustomer = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id <= 0) {
            res.status(400).json({ message: "รหัสลูกค้าไม่ถูกต้อง" });
            return;
        }

        const [customers] = await conn.execute<RowDataPacket[]>(
            "SELECT * FROM customer WHERE customer_id = ?",
            [id]
        );

        if (customers.length === 0) {
            res.status(404).json({ message: "ไม่พบข้อมูลลูกค้า" });
            return;
        }

        res.json(customers[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลลูกค้า" });
    }
};



export const createCustomer = async (req: Request, res: Response) => {
    try {
        const { customer_name, phone_number, location_name, latitude, longitude } = req.body;

        if (
            typeof customer_name !== "string" || customer_name.trim() === "" ||
            typeof phone_number !== "string" || phone_number.trim() === "" ||
            latitude === undefined || longitude === undefined ||
            !Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude)) ||
            Number(latitude) < -90 || Number(latitude) > 90 ||
            Number(longitude) < -180 || Number(longitude) > 180
        ) {
            res.status(400).json({ message: "กรุณากรอกข้อมูลลูกค้าและพิกัดให้ถูกต้อง" });
            return;
        }

        const [result] = await conn.execute<ResultSetHeader>(
            `INSERT INTO customer
            (customer_name, phone_number, location_name, latitude, longitude)
            VALUES (?, ?, ?, ?, ?)`,
            [
                customer_name.trim(),
                phone_number.trim(),
                location_name ?? null,
                Number(latitude),
                Number(longitude)
            ]
        );

        res.status(201).json({
            message: "เพิ่มลูกค้าสำเร็จ",
            customer_id: result.insertId
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการเพิ่มลูกค้า" });
    }
};



export const updateCustomer = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const { customer_name, phone_number, location_name, latitude, longitude } = req.body;

        if (!Number.isSafeInteger(id) || id <= 0) {
            res.status(400).json({ message: "รหัสลูกค้าไม่ถูกต้อง" });
            return;
        }

        if (
            typeof customer_name !== "string" || customer_name.trim() === "" ||
            typeof phone_number !== "string" || phone_number.trim() === "" ||
            latitude === undefined || longitude === undefined ||
            !Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude)) ||
            Number(latitude) < -90 || Number(latitude) > 90 ||
            Number(longitude) < -180 || Number(longitude) > 180
        ) {
            res.status(400).json({ message: "กรุณากรอกข้อมูลลูกค้าและพิกัดให้ถูกต้อง" });
            return;
        }

        const [result] = await conn.execute<ResultSetHeader>(
            `UPDATE customer
             SET customer_name = ?, phone_number = ?, location_name = ?,
                 latitude = ?, longitude = ?
             WHERE customer_id = ?`,
            [
                customer_name.trim(),
                phone_number.trim(),
                location_name ?? null,
                Number(latitude),
                Number(longitude),
                id
            ]
        );

        if (result.affectedRows === 0) {
            res.status(404).json({ message: "ไม่พบข้อมูลลูกค้า" });
            return;
        }

        res.json({ message: "แก้ไขข้อมูลลูกค้าสำเร็จ" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการแก้ไขลูกค้า" });
    }
};


export const deleteCustomer = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id <= 0) {
            res.status(400).json({ message: "รหัสลูกค้าไม่ถูกต้อง" });
            return;
        }

        const [result] = await conn.execute<ResultSetHeader>(
            "DELETE FROM customer WHERE customer_id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            res.status(404).json({ message: "ไม่พบข้อมูลลูกค้า" });
            return;
        }

        res.json({ message: "ลบข้อมูลลูกค้าสำเร็จ" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบลูกค้า" });
    }
};