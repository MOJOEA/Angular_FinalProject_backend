import { conn } from "../dbconnect";
import { Order } from "../Model/Order.model";

export const getOrderById = async (Id: number): Promise<Order> => {
    const query = "SELECT * FROM `order` WHERE `order_id` = ?";
    const [rows]: any = await conn.query(query, [Id]);
    return rows[0] as Order;
};


export const getOrder = async (
  limit?: number,
  lat?: number,
  lng?: number
): Promise<Order[]> => {
  let query = `
    SELECT o.*, c.customer_name, c.phone_number, c.latitude, c.longitude
    FROM \`order\` AS o
    LEFT JOIN \`customer\` AS c ON c.customer_id = o.customer_id
  `;

  const params: number[] = [];

  if (lat !== undefined && lng !== undefined) {
    query += `
      WHERE (
        2 * 6371 * ASIN(SQRT(
          LEAST(1, GREATEST(0,
            POWER(SIN(RADIANS(c.latitude - ?) / 2), 2) +
            COS(RADIANS(?)) * COS(RADIANS(c.latitude)) *
            POWER(SIN(RADIANS(c.longitude - ?) / 2), 2)
          ))
        ))
      ) <= 2
    `;

    params.push(lat, lat, lng);
  }

  query += " ORDER BY o.order_id";

  if (limit !== undefined) {
    query += " LIMIT ?";
    params.push(limit);
  }

  const [rows]: any = await conn.query(query, params);
  return rows as Order[];
};

export const createOrder = async (
  customerId: number,
  boxCount: number,
  orderNote?: string
): Promise<number> => {
  const [result]: any = await conn.query(
    "INSERT INTO `order` (`customer_id`, `box_count`, `order_note`) VALUES (?, ?, ?)",
    [customerId, boxCount, orderNote ?? null]
  );

  return result.insertId;
};

export const resetAndCreateTestOrders = async (): Promise<number[]> => {
  const connection = await conn.getConnection();

  try {
    await connection.beginTransaction();

    const [customers]: any = await connection.query(
      "SELECT `customer_id` FROM `customer`"
    );

    if (customers.length === 0) {
      throw new Error("ไม่พบลูกค้าในตาราง customer");
    }

    await connection.query("DELETE FROM `order`");

    const count = Math.floor(Math.random() * 11) + 20; // 20–30 รายการ
    const orderIds: number[] = [];

    for (let i = 0; i < count; i++) {
      const customer =
        customers[Math.floor(Math.random() * customers.length)];
      const boxCount = Math.floor(Math.random() * 3) + 1;

      const [result]: any = await connection.query(
        "INSERT INTO `order` (`customer_id`, `box_count`, `order_note`) VALUES (?, ?, ?)",
        [customer.customer_id, boxCount, `ออเดอร์ทดสอบ ${i + 1}`]
      );

      orderIds.push(result.insertId);
    }

    await connection.commit();
    return orderIds;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const updateOrderBoxCount = async (
  id: number,
  boxCount: number
): Promise<boolean> => {
  const [result]: any = await conn.query(
    "UPDATE `order` SET `box_count` = ? WHERE `order_id` = ?",
    [boxCount, id]
  );

  if (result.affectedRows > 0) return true;

  // ถ้าจำนวนเท่าเดิม affectedRows อาจเป็น 0 แต่ยังมีออเดอร์นี้อยู่
  const [rows]: any = await conn.query(
    "SELECT `order_id` FROM `order` WHERE `order_id` = ?",
    [id]
  );

  return rows.length > 0;
};

export const deleteOrderById = async (id: number): Promise<boolean> => {
  const [result]: any = await conn.query(
    "DELETE FROM `order` WHERE `order_id` = ?",
    [id]
  );

  return result.affectedRows > 0;
};

export const clearAllOrders = async (): Promise<number> => {
  const [result]: any = await conn.query("DELETE FROM `order`");
  return result.affectedRows;
};
