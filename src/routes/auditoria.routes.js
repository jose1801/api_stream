import { Router } from 'express';
import { conmysql } from '../db.js';

const router = Router();

// 🌟 ENDPOINT DE AUDITORÍA CORREGIDO Y BLINDADO
router.get('/auditoria', async (req, res) => {
    try {
        const { usuario, rol } = req.query; 

        let query = '';
        let params = [];

        // Si no viene un usuario o rol específico, o si es 'admin', listamos TODO por defecto
        if (!usuario || rol === 'admin' || usuario.toLowerCase() === 'admin') {
            query = 'SELECT * FROM auditoria ORDER BY fecha_registro DESC';
        } else {
            // Si es un operador común (Pepe), filtramos solo sus acciones
            query = 'SELECT * FROM auditoria WHERE usuario = ? ORDER BY fecha_registro DESC';
            params = [usuario];
        }

        const [rows] = await conmysql.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('❌ Error al obtener el historial de auditoría de MySQL:', error);
        res.status(500).json({ message: 'Error interno al obtener auditoría' });
    }
});

export default router;