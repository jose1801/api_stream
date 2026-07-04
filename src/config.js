import { config } from 'dotenv';
config();

// Lee las variables de entorno de Render/Aiven, o usa 'localhost' si estás en tu PC
export const DB_HOST = process.env.DB_HOST || 'localhost';
export const DB_USER = process.env.DB_USER || 'root';
export const DB_PASSWORD = process.env.DB_PASSWORD || 'Daniel_2004';

// 🌟 Aquí usamos DB_NAME que es la que creamos en Render, o tu base local si no existe
export const DB_DATABASE = process.env.DB_NAME || 'stream_cipher_db';

export const DB_PORT = process.env.DB_PORT || 3306;
export const PORT = process.env.PORT || 3000;
export const JWT_SECRET = process.env.JWT_SECRET || 'supersecreto123';