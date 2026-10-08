import { conn } from '../dbconnect'; 

export const getCon = async () => { 
  const query = 'SELECT DATABASE() AS databaseName, NOW() AS databasetime';
  const [rows]: any = await conn.query(query); 
  return rows;
};
