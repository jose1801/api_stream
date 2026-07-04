import { createPool } from 'mysql2/promise';
import { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE, DB_PORT } from './config.js'; 

// 🌟 EXPORTACIÓN NOMBRADA: Esto es lo que busca clientesCtrl.js
export const conmysql = createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    port: DB_PORT,
    ssl: {
        rejectUnauthorized: false // Obligatorio para conectar Render con Aiven
    }
});

// Mensaje en consola para confirmar en los logs de Render que se leyó el archivo
console.log('🚀 Archivo db.js cargado e inicializando Pool para Aiven...');