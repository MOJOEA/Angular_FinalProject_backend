import { conn } from "../dbconnect";
import { Order } from "../Model/Order.model";

const ORDER_WRITE_LOCK = "order-write-limit-30";

export class ActiveOrderExistsError extends Error {
  constructor() {
    super("ลูกค้ามีออเดอร์ที่ยังไม่เสร็จสิ้นอยู่แล้ว");
    this.name = "ActiveOrderExistsError";
  }
}

const acquireOrderWriteLock = async (connection: any): Promise<void> => {
  const [rows]: any = await connection.query("SELECT GET_LOCK(?, 10) AS acquired", [ORDER_WRITE_LOCK]);
  if (Number(rows[0]?.acquired) !== 1) {
    throw new Error("ไม่สามารถล็อกการสร้างออเดอร์ได้ กรุณาลองใหม่");
  }
};

const releaseOrderWriteLock = async (connection: any): Promise<void> => {
  await connection.query("SELECT RELEASE_LOCK(?)", [ORDER_WRITE_LOCK]);
};

export const getOrderById = async (Id: number): Promise<Order> => {
    const query = "SELECT * FROM `order` WHERE `order_id` = ?";
    const [rows]: any = await conn.query(query, [Id]);
    return rows[0] as Order;
};


export const getOrder = async (
  status?: string,
  limit?: number,
  lat?: number,
  lng?: number,
  distance: number = 3
): Promise<Order[]> => {
  let query = `
    SELECT o.*, c.customer_name, c.phone_number, c.latitude, c.longitude
    FROM \`order\` AS o
    LEFT JOIN \`customer\` AS c ON c.customer_id = o.customer_id
  `;

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (lat !== undefined && lng !== undefined) {
    conditions.push(`
      (
        2 * 6371 * ASIN(SQRT(
          LEAST(1, GREATEST(0,
            POWER(SIN(RADIANS(c.latitude - ?) / 2), 2) +
            COS(RADIANS(?)) * COS(RADIANS(c.latitude)) *
            POWER(SIN(RADIANS(c.longitude - ?) / 2), 2)
          ))
        ))
      ) <= ?
    `);
    params.push(lat, lat, lng, distance);
  }

  if (status !== undefined) {
    conditions.push("o.status = ?");
    params.push(status);
  }

  if (conditions.length) {
    query += ` WHERE ${conditions.join(" AND ")}`;
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
  const connection = await conn.getConnection();
  let lockAcquired = false;

  if (!Number.isSafeInteger(boxCount) || boxCount < 1 || boxCount > 3) {
      throw new Error("จำนวนกล่องต้องอยู่ระหว่าง 1 ถึง 3");
    }
    const [activeOrders]: any = await connection.query(
      `SELECT order_id
       FROM \`order\`
       WHERE customer_id = ?
         AND (
           status IS NULL
           OR TRIM(status) = ''
           OR LOWER(TRIM(status)) IN ('pending', 'shipping')
         )
       LIMIT 1`,
      [customerId]
    );

    if (activeOrders.length > 0) {
      throw new ActiveOrderExistsError();
    }
    
  try {
    await acquireOrderWriteLock(connection);
    lockAcquired = true;

    const [result]: any = await connection.query(
      "INSERT INTO `order` (`customer_id`, `box_count`, `order_note`) VALUES (?, ?, ?)",
      [customerId, boxCount, orderNote ?? null]
    );

    return result.insertId;
  } finally {
    try {
      if (lockAcquired) await releaseOrderWriteLock(connection);
    } finally {
      connection.release();
    }
  }
};

export const resetAndCreateTestOrders = async (): Promise<number[]> => {
  const connection = await conn.getConnection();
  let lockAcquired = false;
  let transactionStarted = false;

  try {
    await acquireOrderWriteLock(connection);
    lockAcquired = true;
    await connection.beginTransaction();
    transactionStarted = true;

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
    transactionStarted = false;
    return orderIds;
  } catch (error) {
    if (transactionStarted) await connection.rollback();
    throw error;
  } finally {
    try {
      if (lockAcquired) await releaseOrderWriteLock(connection);
    } finally {
      connection.release();
    }
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

export const updateOrderSuccess = async (id: number): Promise<boolean> => {
  const [result]: any = await conn.query(
    "UPDATE `order` SET `status` = ? WHERE `order_id` = ?",
    ["completed", id]
  );
    return result.affectedRows > 0;
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
