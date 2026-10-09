import { conn } from '../dbconnect'; 
import { Order } from '../Model/Order.model';

export interface OrderFilterInput {
  limit?: number;
  lat?:   number;
  lng?:   number;
}

export const getOrdersWithFilters = async (filters: OrderFilterInput): Promise<Order[]> => {
    let sql = "SELECT o.*";
    const queryParams: any[] = [];

    if (filters.lat !== undefined && filters.lng !== undefined) {
        sql += ", (ST_Distance_Sphere(POINT(c.`longitude`, c.`latitude`), POINT(?, ?)) / 1000) AS `distance_km`";
        queryParams.push(filters.lng, filters.lat);
    }

    sql += " FROM `order` o INNER JOIN `customer` c ON o.customer_id = c.customer_id WHERE 1=1";

    if (filters.lat !== undefined && filters.lng !== undefined) {
        sql += " AND c.`latitude` IS NOT NULL AND c.`longitude` IS NOT NULL";
        sql += " AND ST_Distance_Sphere(POINT(c.`longitude`, c.`latitude`), POINT(?, ?)) <= 2000";
        queryParams.push(filters.lng, filters.lat);   
        sql += " ORDER BY `distance_km` ASC";
    } else {
        sql += " ORDER BY o.order_id DESC";
    }

    if (filters.limit !== undefined) {
        sql += " LIMIT ?";
        queryParams.push(filters.limit);
    }

    const [rows]: any = await conn.query(sql, queryParams);
    return rows as Order[];
};


export const getOrderById = async (id: number): Promise<Order | null> => {
  const sql = "SELECT * FROM `order` WHERE `order_id` = ?";
  const [rows]: any = await conn.query(sql, [id]);
  return rows[0] || null;
};

export const createOrder = async (data: { customer_id: number; box_count: number; order_note?: string }): Promise<boolean> => {
  const sql = "INSERT INTO `order` (`customer_id`, `box_count`, `order_note`) VALUES (?, ?, ?)";
  const [result]: any = await conn.query(sql, [data.customer_id, data.box_count, data.order_note || null]);
  return result.affectedRows > 0;
};

export const updateOrder = async (id: number, data: { box_count: number; order_note?: string; status: string }): Promise<boolean> => {
  const sql = "UPDATE `order` SET `box_count`=?, `order_note`=?, `status`=? WHERE `order_id`=?";
  const [result]: any = await conn.query(sql, [data.box_count, data.order_note || null, data.status, id]);
  return result.affectedRows > 0;
};

export const deleteOrder = async (id: number): Promise<boolean> => {
  const sql = "DELETE FROM `order` WHERE `order_id` = ?";
  const [result]: any = await conn.query(sql, [id]);
  return result.affectedRows > 0;
};

export const clearAllOrders = async (): Promise<boolean> => {
  const sql = "TRUNCATE TABLE `order`";
  await conn.query(sql);
  return true;
};

export const getAllCustomerIds = async (): Promise<number[]> => {
  const sql = "SELECT `customer_id` FROM `customer` LIMIT 10";
  const [rows]: any = await conn.query(sql);
  return rows.map((row: any) => row.customer_id);
};
