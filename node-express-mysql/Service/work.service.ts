import { conn } from '../dbconnect';
import { getRouteStopsByWorkId, addRouteStops } from './route.service';

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
      await addRouteStops(newWorkId, stop.order_id, stop.sequence_no);
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

// 2. Main Service: เช็กว่าเป็น Array หรือ Object เดียว
export const createWorkService = async (data: any) => {
  // กรณีส่งมาเป็น Array [...] (บันทึกหลายงานพร้อมกัน)
  if (Array.isArray(data)) {
    const results = [];
    for (const item of data) {
      const created = await createSingleWork(item);
      results.push(created);
    }
    return results;
  }

  // กรณีส่งมาเป็น Object เดียว {}
  return await createSingleWork(data);
};

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
      await addRouteStops(Number(id), stop.order_id, stop.sequence_no);
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