import cron from 'node-cron';
import nodemailer from 'nodemailer';
import { conmysql as pool } from '../db.js';

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
    console.log('🔄 Ejecutando revisión automática de vencimientos para Gmail...');
    try {
        // Consulta SQL limpia para buscar los vencimientos de mañana
        const query = `
            SELECT c.nombre, c.telefono, c.fecha_vencimiento, p.nombre AS nombre_producto
            FROM clientes c
            LEFT JOIN productos p ON c.producto_id = p.id
            WHERE c.fecha_vencimiento = CURDATE() + INTERVAL 1 DAY
        `;

        const [clientes] = await pool.query(query);

        if (clientes.length === 0) {
            console.log('📅 No hay cuentas que expiren el día de mañana.');
            return;
        }

        // Armamos un diseño estético en HTML para que se vea ordenado en el celular
        let cuerpoHTML = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #e74c3c; text-align: center;">⚠️ Alerta de Vencimiento ProStream</h2>
                <p>Hola Administrador, las siguientes suscripciones expiran el día de mañana:</p>
                <hr style="border: none; border-top: 1px solid #eee;" />
        `;

        clientes.forEach((cli) => {
            const fechaFormateada = cli.fecha_vencimiento.toISOString().substring(0, 10);
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
            from: `"ProStream Admin" <${MI_CORREO}>`,
            to: MI_CORREO, // Te lo envías a ti mismo
            subject: '⚠️ Alerta de Vencimiento: Cuentas que expiran mañana',
            html: cuerpoHTML
        };

        // Disparamos el correo real
        await transporador.sendMail(opcionesCorreo);
        console.log('✅ Correo de reporte de vencimientos enviado con éxito.');

    } catch (error) {
        console.error('❌ Error en el proceso del cron de correo:', error);
    }
}

// Programado para ejecutarse todos los días a las 08:00 AM (Hora de Ecuador)
cron.schedule('0 8 * * *', () => {
    verificarYEnviarCorreoVencimientos();
}, {
    scheduled: true,
    timezone: "America/Guayaquil"
});

// 🧪 LÍNEA PARA PROBAR DE INMEDIATO: Descoméntala quitando las '//' si quieres testear apenas guardes
verificarYEnviarCorreoVencimientos();