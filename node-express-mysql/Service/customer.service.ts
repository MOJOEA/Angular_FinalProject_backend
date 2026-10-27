
import { ResultSetHeader } from "mysql2";
import { conn } from "../dbconnect";
import { Customer } from "../Model/Customer.model";

// ดึงข้อมูลลูกค้า โดยค้นหาชื่อ พิกัด และจำกัดจำนวนได้
export const getCustomersService = async (
    name?: string,
    limit?: number,
    lat?: number,
    lng?: number
): Promise<Customer[]> => {
    let query = "SELECT * FROM `customer`";
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    // ค้นหาตามชื่อ
    if (name !== undefined) {
        conditions.push("`customer_name` LIKE ?");
        params.push(`%${name.trim()}%`);
    }

    // ค้นหาลูกค้าในระยะ 1 กิโลเมตร
    if (lat !== undefined && lng !== undefined) {
        conditions.push(`
            latitude IS NOT NULL
            AND longitude IS NOT NULL
            AND ST_Distance_Sphere(
                POINT(longitude, latitude),
                POINT(?, ?)
            ) <= 1000
        `);

        params.push(lng, lat);
    }

    // รวมเงื่อนไขค้นหา
    if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
    }

    // จำกัดจำนวนข้อมูล
    if (limit !== undefined) {
        query += " LIMIT ?";
        params.push(limit);
    }

    const [rows] = await conn.query(query, params);

    return rows as Customer[];
};

// ดึงข้อมูลลูกค้าตาม ID
export const getCustomerService = async (
    id: number
): Promise<Customer | null> => {
    const query =
        "SELECT * FROM `customer` WHERE `customer_id` = ?";

    const [rows] = await conn.query(query, [id]);
    const customers = rows as Customer[];
    const customer = customers.length > 0 ? customers[0] : null;

    return customer ?? null;
};

// เพิ่มลูกค้า
export const createCustomerService = async (
    customer_name: string,
    phone_number: string,
    location_name: string | null,
    latitude: number,
    longitude: number
): Promise<number> => {
    const query = `
        INSERT INTO \`customer\`
        (customer_name, phone_number, location_name, latitude, longitude)
        VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await conn.execute<ResultSetHeader>(query, [
        customer_name,
        phone_number,
        location_name,
        latitude,
        longitude
    ]);

    return result.insertId;
};

// แก้ไขข้อมูลลูกค้า
export const updateCustomerService = async (
    id: number,
    customer_name: string,
    phone_number: string,
    location_name: string | null,
    latitude: number,
    longitude: number
): Promise<number> => {
    const query = `
        UPDATE \`customer\`
        SET customer_name = ?,
            phone_number = ?,
            location_name = ?,
            latitude = ?,
            longitude = ?
        WHERE customer_id = ?
    `;

    const [result] = await conn.execute<ResultSetHeader>(query, [
        customer_name,
        phone_number,
        location_name,
        latitude,
        longitude,
        id
    ]);

    return result.affectedRows;
};

// ลบลูกค้า
export const deleteCustomerService = async (
    id: number
): Promise<number> => {
    const query =
        "DELETE FROM `customer` WHERE `customer_id` = ?";

    const [result] = await conn.execute<ResultSetHeader>(query, [id]);

    return result.affectedRows;
};
