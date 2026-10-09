import { conn } from '../dbconnect'; // เปลี่ยนมาอิมพอร์ต { conn } ให้ตรงกับใน dbconnect.ts
import { Works } from '../Model/Works.model';

// GET ALL
export const getAllWorksService = async () => {
  const [rows] = await conn.query('SELECT * FROM works');
  return rows as Works[];
};

// GET BY ID
export const getWorkByIdService = async (id: string) => {
  const [rows]: any = await conn.query('SELECT * FROM works WHERE work_id = ?', [id]);
  return (rows[0] as Works) || null;
};

// CREATE
export const createWorkService = async (data: any) => {
  const [result]: any = await conn.query('INSERT INTO works SET ?', [data]);
  return result;
};

// UPDATE
export const updateWorkByIdService = async (id: string, data: any) => {
  const [result]: any = await conn.query('UPDATE works SET ? WHERE work_id = ?', [data, id]);
  return result;
};

// DELETE BY ID
export const deleteWorkByIdService = async (id: string) => {
  await conn.query('DELETE FROM works WHERE work_id = ?', [id]);
  return true;
};

// CLEAR ALL
export const clearAllWorksService = async () => {
  await conn.query('DELETE FROM works');
  return true;
};