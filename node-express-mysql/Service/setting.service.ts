import { conn } from '../dbconnect'; 

import { Settings } from '../Model/Settings.model';

// ฟังก์ชัน: ดึงข้อมูลทั้งหมด(แถวเดียว) : ตาราง settings
export const getSetting = async (): Promise<Settings> => { 
  const query = 'SELECT * FROM settings';
  const [rows]: any = await conn.query(query); 
  return rows[0] as Settings;
};

// ฟังก์ชัน: อัพเดทข้อมูล : ตาราง settings
export const updateSettings = async (id: number, settingsData: Settings): Promise<boolean> => {
    const sql = "UPDATE `settings` SET `shop_name`=?, `shop_address`=?, `shop_latitude`=?, `shop_longitude`=?, `box_price`=?, `box_cost`=?, `rider_base_fee`=?, `rider_fee_per_km_per_box`=?, `rider_speed_kmh`=?, `max_orders_per_rider`=?, `max_boxes_per_order`=?, `departure_time`=?, `delivery_window_minutes`=?, `service_radius_km`=? WHERE `id`=?";
    const [result]: any = await conn.query(sql, [
        settingsData.shop_name,
        settingsData.shop_address,
        settingsData.shop_latitude,
        settingsData.shop_longitude,
        settingsData.box_price,
        settingsData.box_cost,
        settingsData.rider_base_fee,
        settingsData.rider_fee_per_km_per_box,
        settingsData.rider_speed_kmh,
        settingsData.max_orders_per_rider,
        settingsData.max_boxes_per_order,
        settingsData.departure_time,
        settingsData.delivery_window_minutes,
        settingsData.service_radius_km,
        id
    ]);
    return result.affectedRows > 0;
};
