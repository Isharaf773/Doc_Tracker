import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const isCloudDatabase =
  process.env.DB_HOST &&
  process.env.DB_HOST !== "localhost" &&
  process.env.DB_HOST !== "127.0.0.1";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "doctrack",
  port: Number(process.env.DB_PORT || 3306),
  ...(isCloudDatabase
    ? {
        ssl: {
          rejectUnauthorized: false
        }
      }
    : {}),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}
