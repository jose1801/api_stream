import cron from 'node-cron';
import nodemailer from 'nodemailer';
import { initializeApp, cert } from 'firebase-admin/app'; // 👈 IMPORTACIÓN DIRECTA Y SEGURA DE CERT
import { getMessaging } from 'firebase-admin/messaging';
import { conmysql as pool } from '../db.js';
import { createRequire } from 'module';

// Permite cargar el archivo JSON usando ES Modules de forma limpia
const require = createRequire(import.meta.url);
const serviceAccount = require('../../firebase-key.json'); 

// 🌟 INICIALIZAR CONEXIÓN SEGURA SIN USAR EL OBJETO 'ADMIN' GLOBAL
const firebaseApp = initializeApp({
    credential: cert(serviceAccount) // 👈 Usamos la función cert directamente aquí
});

console.log('⏰ Servidor de alertas (Gmail + Push Firebase) inicializado correctamente.');

// 🌟 CONFIGURA AQUÍ TU GMAIL Y LAS 16 LETRAS QUE TE DIO GOOGLE
const MI_CORREO = 'js8754527@gmail.com'; 
const MI_CLAVE_APLICACION = 'eityiknuydvfqhyx'; 

// Configuración del motor de envío de correos
const transporador = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: MI_CORREO,
        pass: MI_CLAVE_APLICACION
    }
});

async function verificarYEnviarCorreoVencimientos() {
    console.log('🔄 Ejecutando revisión automática de vencimientos (Gmail + Push)...');
    try {
        // Consulta SQL limpia para buscar los vencimientos de mañana, incluyendo el token del dispositivo
        const query = `
            SELECT c.nombre, c.telefono, c.fecha_vencimiento, c.token_dispositivo, p.nombre AS nombre_producto
            FROM clientes c
            LEFT JOIN productos p ON c.producto_id = p.id
            WHERE c.fecha_vencimiento = CURDATE() + INTERVAL 1 DAY
        `;

        const [clientes] = await pool.query(query);

        if (clientes.length === 0) {
            console.log('📅 No hay cuentas que expiren el día de mañana.');
            return;
        }

        // --- 1. BLOQUE DE CORREO ELECTRÓNICO ---
        let cuerpoHTML = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #e74c3c; text-align: center;">⚠️ Alerta de Vencimiento Stream Cipher</h2>
                <p>Hola Administrador, las siguientes suscripciones expiran el día de mañana:</p>
                <hr style="border: none; border-top: 1px solid #eee;" />
        `;

        clientes.forEach((cli) => {
            const fechaFormateada = cli.fecha_vencimiento instanceof Date 
                ? cli.fecha_vencimiento.toISOString().substring(0, 10)
                : cli.fecha_vencimiento;

            cuerpoHTML += `
                <div style="background-color: #f9f9f9; padding: 15px; margin-bottom: 10px; border-left: 4px solid #e74c3c; border-radius: 4px;">
                    <p style="margin: 4px 0;"><strong>👤 Cliente:</strong> ${cli.nombre}</p>
                    <p style="margin: 4px 0;"><strong>📱 Celular:</strong> ${cli.telefono || 'No registrado'}</p>
                    <p style="margin: 4px 0;"><strong>📺 Plataforma:</strong> ${cli.nombre_producto || 'No asignada'}</p>
                    <p style="margin: 4px 0;"><strong>📅 Fecha Expiración:</strong> ${fechaFormateada}</p>
                </div>
            `;
        });

        cuerpoHTML += `
                <hr style="border: none; border-top: 1px solid #eee;" />
                <p style="font-size: 12px; color: #7f8c8d; text-align: center;">Este es un reporte automático generado por el backend de tu aplicación.</p>
            </div>
        `;

        const opcionesCorreo = {
            from: `"Stream Cipher Admin" <${MI_CORREO}>`,
            to: MI_CORREO,
            subject: '⚠️ Alerta de Vencimiento: Cuentas que expiran mañana',
            html: cuerpoHTML
        };

        await transporador.sendMail(opcionesCorreo);
        console.log('✅ Correo de reporte de vencimientos enviado con éxito.');

        // --- 2. BLOQUE DE NOTIFICACIONES PUSH NATIVAS (Firebase Modular) ---
        console.log('📲 Procesando el envío de notificaciones push a dispositivos registrados...');
        
        for (const cli of clientes) {
            if (cli.token_dispositivo) {
                const mensajePush = {
                    notification: {
                        title: '⚠️ Suscripción por vencer mañana',
                        body: `${cli.nombre} - ${cli.nombre_producto || 'Plataforma'}`
                    },
                    token: cli.token_dispositivo
                };

                try {
                    const response = await getMessaging(firebaseApp).send(mensajePush);
                    console.log(`✅ Push nativo enviado con éxito para ${cli.nombre}. ID: ${response}`);
                } catch (pushError) {
                    console.error(`❌ Error al enviar push para ${cli.nombre}:`, pushError);
                }
            } else {
                console.warn(`⚠️ No se envió push para ${cli.nombre} porque no cuenta con un token_dispositivo.`);
            }
        }

    } catch (error) {
        console.error('❌ Error en el proceso general de alertas:', error);
    }
}

// Programado para ejecutarse todos los días a las 08:00 AM (Hora de Ecuador)
cron.schedule('0 8 * * *', () => {
    verificarYEnviarCorreoVencimientos();
}, {
    scheduled: true,
    timezone: "America/Guayaquil"
});

// 🧪 LÍNEA PARA PROBAR DE INMEDIATO EN CADA ARRANQUE:
verificarYEnviarCorreoVencimientos();