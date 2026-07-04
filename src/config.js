import { config } from 'dotenv';
config();

// Nota cómo aquí le decimos que busque process.env.BD_... (con BD)
export const DB_HOST = process.env.BD_HOST || 'localhost';
export const DB_USER = process.env.BD_USER || 'root';
export const DB_PASSWORD = process.env.BD_PASSWORD || 'Daniel_2004';
export const DB_DATABASE = process.env.BD_DATABASE || 'stream_cipher_db';
export const DB_PORT = process.env.BD_PORT || 3306;
export const PORT = process.env.PORT || 3000;
export const JWT_SECRET = process.env.JWT_SECRET || 'supersecreto123';