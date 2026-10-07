import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const conn = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || '',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_MAX_CONNECTIONS || '10', 10),
  queueLimit: 0
});
