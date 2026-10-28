
import { Request, Response } from "express";

import {
    getCustomersService,
    getCustomerService,
    createCustomerService,
    updateCustomerService,
    deleteCustomerService
} from "../Service/customer.service";

// GET: ดึงข้อมูลลูกค้าทั้งหมด / ค้นหา / จำกัดจำนวน / ค้นหาใกล้พิกัด
export const getCustomers = async (req: Request, res: Response) => {
    try {
        const { name, limit, lat, lng } = req.query;

        // ต้องระบุพิกัดทั้ง lat และ lng
        if (
            (lat !== undefined && lng === undefined) ||
            (lat === undefined && lng !== undefined)
        ) {
            res.status(400).json({
                message: "กรุณาระบุทั้ง lat และ lng"
            });
            return;
        }

        // ตรวจสอบชื่อ
        if (name !== undefined && typeof name !== "string") {
            res.status(400).json({
                message: "ชื่อที่ใช้ค้นหาไม่ถูกต้อง"
            });
            return;
        }

        // ตรวจสอบ limit
        let numberLimit: number | undefined;

        if (limit !== undefined) {
            if (
                typeof limit !== "string" ||
                !/^[1-9]\d*$/.test(limit) ||
                !Number.isSafeInteger(Number(limit))
            ) {
                res.status(400).json({
                    message: "limit ต้องเป็นจำนวนเต็มบวก"
                });
                return;
            }

            numberLimit = Number(limit);
        }

        // ตรวจสอบพิกัด
        let latitude: number | undefined;
        let longitude: number | undefined;

        if (lat !== undefined && lng !== undefined) {
            if (typeof lat !== "string" || typeof lng !== "string") {
                res.status(400).json({
                    message: "พิกัดไม่ถูกต้อง"
                });
                return;
            }

            latitude = Number(lat);
            longitude = Number(lng);

            if (
                lat.trim() === "" ||
                lng.trim() === "" ||
                !Number.isFinite(latitude) ||
                latitude < -90 ||
                latitude > 90 ||
                !Number.isFinite(longitude) ||
                longitude < -180 ||
                longitude > 180
            ) {
                res.status(400).json({
                    message: "พิกัดไม่ถูกต้อง"
                });
                return;
            }
        }

        const customers = await getCustomersService(
            name as string | undefined,
            numberLimit,
            latitude,
            longitude
        );

        res.json(customers);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "เกิดข้อผิดพลาดในการดึงข้อมูลลูกค้า"
        });
    }
};

// GET: ดึงข้อมูลลูกค้าตาม ID

export const getCustomer = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id <= 0) {
            res.status(400).json({
                message: "รหัสลูกค้าไม่ถูกต้อง"
            });
            return;
        }

        const customer = await getCustomerService(id);

        if (customer === null) {
            res.status(404).json({
                message: "ไม่พบข้อมูลลูกค้า"
            });
            return;
        }

        res.json(customer);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "เกิดข้อผิดพลาดในการดึงข้อมูลลูกค้า"
        });
    }
};


// POST: เพิ่มลูกค้า
export const createCustomer = async (req: Request, res: Response) => {
    try {
        const {
            customer_name,
            phone_number,
            location_name,
            latitude,
            longitude
        } = req.body;

        if (
            typeof customer_name !== "string" ||
            customer_name.trim() === "" ||
            typeof phone_number !== "string" ||
            phone_number.trim() === "" ||
            latitude === undefined ||
            longitude === undefined ||
            (typeof latitude !== "number" && typeof latitude !== "string") ||
            (typeof longitude !== "number" && typeof longitude !== "string") ||
            (typeof latitude === "string" && latitude.trim() === "") ||
            (typeof longitude === "string" && longitude.trim() === "") ||
            !Number.isFinite(Number(latitude)) ||
            !Number.isFinite(Number(longitude)) ||
            Number(latitude) < -90 ||
            Number(latitude) > 90 ||
            Number(longitude) < -180 ||
            Number(longitude) > 180 ||
            (location_name != null && typeof location_name !== "string")
        ) {
            res.status(400).json({
                message: "กรุณากรอกข้อมูลลูกค้าและพิกัดให้ถูกต้อง"
            });
            return;
        }

        const result = await createCustomerService(
            customer_name.trim(),
            phone_number.trim(),
            location_name?.trim() || null,
            Number(latitude),
            Number(longitude)
        );

        res.status(201).json({
            message: "เพิ่มลูกค้าสำเร็จ",
            customer_id: result
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "เกิดข้อผิดพลาดในการเพิ่มลูกค้า"
        });
    }
};

// PUT: แก้ไขข้อมูลลูกค้า
export const updateCustomer = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        const {
            customer_name,
            phone_number,
            location_name,
            latitude,
            longitude
        } = req.body;

        if (!Number.isSafeInteger(id) || id <= 0) {
            res.status(400).json({
                message: "รหัสลูกค้าไม่ถูกต้อง"
            });
            return;
        }

        if (
            typeof customer_name !== "string" ||
            customer_name.trim() === "" ||
            typeof phone_number !== "string" ||
            phone_number.trim() === "" ||
            latitude === undefined ||
            longitude === undefined ||
            (typeof latitude !== "number" && typeof latitude !== "string") ||
            (typeof longitude !== "number" && typeof longitude !== "string") ||
            (typeof latitude === "string" && latitude.trim() === "") ||
            (typeof longitude === "string" && longitude.trim() === "") ||
            !Number.isFinite(Number(latitude)) ||
            !Number.isFinite(Number(longitude)) ||
            Number(latitude) < -90 ||
            Number(latitude) > 90 ||
            Number(longitude) < -180 ||
            Number(longitude) > 180 ||
            (location_name != null && typeof location_name !== "string")
        ) {
            res.status(400).json({
                message: "กรุณากรอกข้อมูลลูกค้าและพิกัดให้ถูกต้อง"
            });
            return;
        }

        const result = await updateCustomerService(
            id,
            customer_name.trim(),
            phone_number.trim(),
            location_name?.trim() || null,
            Number(latitude),
            Number(longitude)
        );

        if (result === 0) {
            res.status(404).json({
                message: "ไม่พบข้อมูลลูกค้า"
            });
            return;
        }

        res.json({
            message: "แก้ไขข้อมูลลูกค้าสำเร็จ"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "เกิดข้อผิดพลาดในการแก้ไขลูกค้า"
        });
    }
};

// DELETE: ลบข้อมูลลูกค้า
export const deleteCustomer = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id <= 0) {
            res.status(400).json({
                message: "รหัสลูกค้าไม่ถูกต้อง"
            });
            return;
        }

        const result = await deleteCustomerService(id);

        if (result === 0) {
            res.status(404).json({
                message: "ไม่พบข้อมูลลูกค้า"
            });
            return;
        }

        res.json({
            message: "ลบข้อมูลลูกค้าสำเร็จ"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "เกิดข้อผิดพลาดในการลบลูกค้า"
        });
    }
};
