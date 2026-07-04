import { config } from 'dotenv';
config(); // Carga las variables desde el archivo .env

export const PORT = process.env.PORT || 3000;
export const DB_HOST = process.env.DB_HOST;
export const DB_USER = process.env.DB_USER;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_PORT = process.env.DB_PORT;

// 🌟 MAPEADO CLAVE: Tu db.js busca DB_DATABASE, así que le asignamos el DB_NAME de Render
export const DB_DATABASE = process.env.DB_NAME;