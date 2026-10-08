import { conn } from '../dbconnect'; 

export const getSetting = async () => { 
  const query = 'SELECT * FROM settings';
  const [rows]: any = await conn.query(query); 
  return rows;
};
