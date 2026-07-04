import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './config.js';

export const verifyToken = (req, res, next) => {
    // 🌟 EXCEPCIÓN AMPLIADA: Deja pasar búsquedas Y la inserción de nuevos clientes de forma express
    if (req.originalUrl.includes('/ventas/cliente/') || req.originalUrl.endsWith('/api/clientes')) {
        return next();
    }

    // Obtener el token desde los headers (usualmente en 'Authorization')
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(403).json({ message: 'No se proporcionó un token de seguridad' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token no válido o expirado' });
    }
};
export const verificarToken = verifyToken;