import { Resend } from 'resend';

// 🌟 INICIALIZACIÓN AUTÉNTICA CON TU API KEY
const resend = new Resend('re_G5YEbHQU_NLQiue4bSYsdFwfgdwYzMm5g'); 

/**
 * Función para enviar el detalle de la compra al Administrador mediante API HTTP
 */
export const enviarNotificacionCompra = async (detallePedido, total) => {
  try {
    let filasProductos = '';
    
    // Recorremos el vector anidado del carrito con filtros de seguridad
    detallePedido.forEach(item => {
      const nombre = item.producto?.prod_nombre || item.prod_nombre || 'Producto';
      const precio = item.producto?.prod_precio || item.prod_precio || 0;
      const cantidad = item.cantidad || 0;
      const subtotal = item.subtotal || (precio * cantidad);

      filasProductos += `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${nombre}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${cantidad}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${Number(precio).toFixed(2)}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${Number(subtotal).toFixed(2)}</td>
        </tr>
      `;
    });

    console.log('🚀 Enviando correo de alerta mediante la API HTTP de Resend...');

    // Despachamos el correo usando el canal web seguro
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // Dominio de prueba obligatorio y gratuito de Resend
      to: 'jdaniel.salinas03@gmail.com', // 🌟 CORRECCIÓN CRUCIAL: Tu correo autorizado por Resend para Sandbox
      subject: '🚨 ¡Nueva Compra Recibida en el Sistema!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #ffffff; color: #333333;">
          <h2 style="color: #2dd36f; text-align: center; margin-bottom: 20px;">🛒 ¡Nueva Orden de Compra!</h2>
          <p>Hola Administrador, se ha registrado un nuevo pedido desde la aplicación móvil utilizando vectores anidados. A continuación el detalle de los artículos:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Producto</th>
                <th style="padding: 8px; border: 1px solid #ddd;">Cant.</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">P. Unit</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${filasProductos}
            </tbody>
          </table>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; text-align: right; border-radius: 5px; border-left: 4px solid #2dd36f;">
            <h3 style="margin: 0; color: #111;">Total General a Cobrar: <span style="color: #2dd36f; font-size: 1.4rem;">$${Number(total).toFixed(2)}</span></h3>
          </div>
          
          <p style="font-size: 0.8rem; color: #888; margin-top: 30px; text-align: center;">Sistema Inteligente de Gestión y Ventas • UPSE 2026</p>
        </div>
      `
    });

    if (error) {
      console.error('❌ Resend rechazó el envío del correo:', error);
      throw error;
    }

    console.log('📧 ¡Correo enviado volando por HTTP!', data);
    return data;

  } catch (err) {
    console.error('❌ Error crítico en el módulo de correo con Resend:', err);
    throw err;
  }
};