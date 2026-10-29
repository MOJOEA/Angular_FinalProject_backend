import { conn } from '../dbconnect'; 
import { SampleWork } from '../Model/Works.model';
import { getRouteStopsByWorkId } from './route.service';

// 1. GET ALL (ดึงงานทั้งหมด พร้อมดึง stops ของแต่ละงาน)
export const getAllWorksService = async () => {
  const [works]: any = await conn.query('SELECT * FROM works');

  const worksWithStops = await Promise.all(
    works.map(async (work: any) => {
      const stops = await getRouteStopsByWorkId(work.work_id);
      return {
        ...work,
        stops: stops
      };
    })
  );

  return worksWithStops;
};

// 2. GET BY ID (ดึงงานตาม id พร้อมรายการ stops)
export const getWorkByIdService = async (id: string | number) => {
  const [works]: any = await conn.query('SELECT * FROM works WHERE work_id = ?', [id]);
  if (!works[0]) return null;

  const stops = await getRouteStopsByWorkId(Number(id));

  return {
    ...works[0],
    stops: stops
  };
};

// 1. สร้าง Helper Function สำหรับบันทึกงานทีละ 1 รายการ
const createSingleWork = async (item: any) => {
  const payload = item.data ? item.data : item;

  // คัดเฉพาะ Column ที่มีในตาราง works จริงๆ
  const workPayload = {
    job_code: payload.job_code,
    color: payload.color || 'น้ำเงิน',
    status: payload.status || 'pending',
    total_orders: Array.isArray(payload.stops) ? payload.stops.length : 0,
    total_boxes: payload.total_boxes || 0
  };

  // บันทึกลงตาราง works
  const [result]: any = await conn.query('INSERT INTO works SET ?', [workPayload]);
  const newWorkId = result.insertId;

  // บันทึกรายการ stops (ถ้ามี)
  if (payload.stops && Array.isArray(payload.stops) && payload.stops.length > 0) {
    for (const stop of payload.stops) {
    }
  }

  // ดึงข้อมูล stops ที่บันทึกเสร็จแล้วกลับมา
  const savedStops = await getRouteStopsByWorkId(newWorkId);

  return {
    work_id: newWorkId,
    ...workPayload,
    stops: savedStops
  };
};

export const createWorkService = async () => {
const sampleWorks: SampleWork[] = [
  { job_code: 'JOB-20261009-001', color: '#FF5733', status: 'pending', total_orders: 0, total_boxes: 0, created_at: '2026-10-16 03:13:33', updated_at: '2026-10-28 18:54:36' },
  { job_code: 'JOB-20261009-002', color: '#33FF57', status: 'pending', total_orders: 0, total_boxes: 0, created_at: '2026-10-16 03:13:33', updated_at: '2026-10-28 18:54:36' },
  { job_code: 'JOB-20261009-003', color: '#3357FF', status: 'pending', total_orders: 0, total_boxes: 0, created_at: '2026-10-16 03:13:33', updated_at: '2026-10-28 18:54:36' },
  { job_code: 'JOB-20261009-004', color: '#F1C40F', status: 'pending', total_orders: 0, total_boxes: 0, created_at: '2026-10-16 03:13:33', updated_at: '2026-10-28 18:54:36' },
  { job_code: 'JOB-20261009-005', color: '#9B59B6', status: 'pending', total_orders: 0, total_boxes: 0, created_at: '2026-10-16 03:13:33', updated_at: '2026-10-28 18:54:36' },
  { job_code: 'JOB-20261009-006', color: '#1ABC9C', status: 'pending', total_orders: 0, total_boxes: 0, created_at: '2026-10-16 03:13:33', updated_at: '2026-10-28 18:54:36' },
  { job_code: 'JOB-20261009-007', color: '#E91E63', status: 'pending', total_orders: 0, total_boxes: 0, created_at: '2026-10-16 03:13:33', updated_at: '2026-10-28 18:54:36' },
  { job_code: 'JOB-20261009-008', color: '#34495E', status: 'pending', total_orders: 0, total_boxes: 0, created_at: '2026-10-16 03:13:33', updated_at: '2026-10-28 18:54:36' },
  { job_code: 'JOB-20261009-009', color: '#FF8D1A', status: 'pending', total_orders: 0, total_boxes: 0, created_at: '2026-10-16 03:13:33', updated_at: '2026-10-28 18:47:30' },
  { job_code: 'JOB-20261009-010', color: '#8B4513', status: 'pending', total_orders: 0, total_boxes: 0, created_at: '2026-10-16 03:13:33', updated_at: '2026-10-28 18:47:30' },
  { job_code: 'JOB-20261009-011', color: '#2ECC71', status: 'pending', total_orders: 0, total_boxes: 0, created_at: '2026-10-16 03:13:33', updated_at: '2026-10-16 06:47:15' },
  { job_code: 'JOB-20261009-012', color: '#00FFFF', status: 'pending', total_orders: 0, total_boxes: 0, created_at: '2026-10-16 03:13:33', updated_at: '2026-10-16 06:12:33' }
];

  await conn.query('DELETE FROM `works`',);
  await conn.query('ALTER TABLE `works` AUTO_INCREMENT = 1;',);

  let firstInsertedId: number | null = null;

  for (const item of sampleWorks) {
    const [result] = await conn.query(
      `INSERT INTO \`works\`(\`job_code\`, \`color\`, \`status\`,\`total_orders\`, \`total_boxes\`, \`created_at\`, \`updated_at\`)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [ item.job_code, item.color, item.status, item.total_orders, item.total_boxes, item.created_at, item.updated_at]
    );

    if (firstInsertedId === null) {
      firstInsertedId = (result as { insertId: number }).insertId;
    }
  }

  return firstInsertedId;
}


// 4. UPDATE BY ID (อัปเดตงานตาม ID และอัปเดตรายการ stops)
export const updateWorkByIdService = async (id: string | number, data: any) => {
  const { stops, ...workData } = data;

  // 4.1 ตรวจสอบว่ามีงานนี้ในระบบหรือไม่
  const [existingWork]: any = await conn.query('SELECT * FROM works WHERE work_id = ?', [id]);
  if (!existingWork[0]) return null;

  const workPayload = {
    ...workData,
    total_orders: stops ? stops.length : existingWork[0].total_orders,
    total_boxes: workData.total_boxes !== undefined ? workData.total_boxes : existingWork[0].total_boxes
  };

  // 4.2 อัปเดตข้อมูลตารางหลัก works
  await conn.query('UPDATE works SET ? WHERE work_id = ?', [workPayload, id]);

  // 4.3 ถ้ามีการส่ง stops มาด้วย ให้ลบของเก่าแล้วบันทึก stops ชุดใหม่เข้าไป
  if (stops && Array.isArray(stops)) {
    await conn.query('DELETE FROM route_stops WHERE work_id = ?', [id]);
    for (const stop of stops) {
      // await addRouteStops(Number(id), stop.order_id, stop.sequence_no);
    }
  }

  // 4.4 ดึงข้อมูลล่าสุดพร้อม stops ส่งกลับ
  const updatedStops = await getRouteStopsByWorkId(Number(id));
  const [updatedWork]: any = await conn.query('SELECT * FROM works WHERE work_id = ?', [id]);

  return {
    ...updatedWork[0],
    stops: updatedStops
  };
};



export const deleteWorkByIdService = async (id: string | number) => {

  await conn.query('DELETE FROM route_stops WHERE work_id = ?', [id]);
  const [result]: any = await conn.query('DELETE FROM works WHERE work_id = ?', [id]);
  return result.affectedRows > 0;
};

// 6. CLEAR ALL WORKS (ลบงานทั้งหมด)
export const clearAllWorksService = async () => {
  await conn.query('DELETE FROM route_stops');
  const [result]: any = await conn.query('DELETE FROM works');
  return result.affectedRows > 0;
};

// 1. Service สำหรับรับงาน (accept)
export const acceptWorkService = async (job_code: string | number) => {
  // 1.1 ค้นหาข้อมูลสถานะปัจจุบันของงานนี้ก่อน
  const [rows]: any = await conn.query('SELECT work_id, status FROM works WHERE job_code = ?', [job_code]);

  // หากไม่งานในระบบ
  if (!rows || rows.length === 0) {
    return { found: false };
  }

  // const currentStatus = rows[0].status;
  const { work_id, status: currentStatus } = rows[0];

  // 1.2 ถ้าสถานะเป็น shipping อยู่แล้ว -> ไม่ต้องอัปเดต conn
  if (currentStatus === 'shipping') {
    return { found: true, isAlreadyShipping: true };
  }

  // 1.3 ถ้ายังไม่เป็น shipping -> อัปเดตสถานะเป็น shipping
  await conn.query('UPDATE works SET status = ? WHERE job_code = ?', ['shipping', job_code]);
  return { found: true, isAlreadyShipping: false, work_id: work_id };
};

// 2. Service สำหรับออกจากงาน (logout)
export const logoutWorkService = async (workId: string | number) => {
  // 2.1 ตรวจสอบว่ามีงานนี้ในระบบหรือไม่
  const [rows]: any = await conn.query('SELECT work_id FROM works WHERE work_id = ?', [workId]);

  if (!rows || rows.length === 0) {
    return { found: false };
  }

  // 2.2 เปลี่ยนสถานะกลับเป็น pending
  await conn.query('UPDATE works SET status = ? WHERE work_id = ?', ['pending', workId]);
  return { found: true };
};