import { conn } from '../dbconnect'; 

import { RouteStop } from '../Model/RouteStop.model'

// ฟังก์ชัน: ดึงข้อมูลทั้งหมด : ตาราง route_stops
export const getRouteStops = async (): Promise<RouteStop[]> => {
    const query = "SELECT * FROM `route_stops` ORDER BY `sequence_no` ASC";
    const [rows]: any = await conn.query(query);
    return rows as RouteStop[];
};

// ฟังก์ชัน: ดึงข้อมูลแค่ 1 แถวจาก id ตารางตนเอง : ตาราง route_stops
export const getRouteStopsById = async (Id: number): Promise<RouteStop> => {
    const query = "SELECT * FROM `route_stops` WHERE `stop_id` = ?";
    const [rows]: any = await conn.query(query, [Id]);
    return rows[0] as RouteStop;
};

// ฟังก์ชัน: ดึงข้อมูลทั้งหมดที่ id เชื่อมกับ work_id ที่กำหนด : ตาราง route_stops
export const getRouteStopsByWorkId = async (workId: number): Promise<RouteStop[]> => {
    const query = "SELECT * FROM `route_stops` WHERE `work_id` = ? ORDER BY `sequence_no` ASC";
    const [rows]: any = await conn.query(query, [workId]);
    return rows as RouteStop[];
};

// ฟังก์ชัน: เพิ่มข้อมูล : ตาราง route_stops
export const addRouteStops = async (workId: number, order_id: number, sequence_no: number): Promise<boolean> => {
    const query = "INSERT INTO `route_stops` (`work_id`, `order_id`, `sequence_no`, `status`) VALUES (?, ?, ?, 'pending')"
    const [result]: any = await conn.query(query, [workId, order_id, sequence_no]);
    return result.affectedRows > 0;
};
