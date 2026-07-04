import { enviarNotificacionCompra } from '../email.js';

export const procesarNuevaVenta = async (req, res) => {
  try {
    const { carrito, total } = req.body;

    if (!carrito || carrito.length === 0) {
      return res.status(400).json({ OK: false, mensaje: 'El carrito está vacío' });
    }

    // 📧 Esperamos que se envíe el correo usando HTTP
    await enviarNotificacionCompra(carrito, total);

    return res.json({
      OK: true,
      mensaje: '¡Pedido recibido! Notificación de correo enviada al administrador.'
    });

  } catch (error) {
    console.error('Error en ventasCtrl:', error);
    return res.status(500).json({ OK: false, mensaje: 'Error al procesar la venta o enviar el correo.' });
  }
};