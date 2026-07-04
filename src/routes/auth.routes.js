import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'; 
import { JWT_SECRET } from '../config.js';
import { conmysql } from '../db.js'; 

const router = Router();

// ==========================================
// RUTA 1: INICIO DE SESIÓN (LOGIN)
// ==========================================
router.post('/login', async (req, res) => {
    const { usr_usuario, usr_clave } = req.body;
    
    console.log("Intentando iniciar sesión con:", { usr_usuario, usr_clave });

    try {
        // Buscamos al usuario únicamente por su nombre de usuario
        const [result] = await conmysql.query(
            'SELECT * FROM usuarios WHERE usr_usuario = ?', 
            [usr_usuario]
        );

        // Si no encuentra el usuario, detenemos el proceso
        if (result.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const user = result[0]; // Capturamos los datos del usuario encontrado

        // Comparamos la clave recibida en texto plano con la clave encriptada de la BD
        const esClaveCorrecta = await bcrypt.compare(usr_clave, user.usr_clave);

        if (esClaveCorrecta) {
            // Generamos el token guardando su usr_id y su nombre, expirando en 2 horas
            const token = jwt.sign(
                { id: user.usr_id, username: user.usr_usuario }, 
                JWT_SECRET, 
                { expiresIn: '2h' }
            );
            
            // 🌟 CORRECCIÓN: Devolvemos 'usr_usuario' en el JSON de respuesta.
            // Así tu archivo login.page.ts en Ionic lo guarda directo en el localStorage
            return res.json({ 
                message: 'Autenticación exitosa', 
                token,
                usr_usuario: user.usr_usuario 
            });
        } else {
            // Si la contraseña no coincide
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

    } catch (error) {
        console.error("Error en el login:", error);
        return res.status(500).json({ message: 'Error interno del servidor al intentar hacer login' });
    }
});

// ==========================================
// RUTA 2: REGISTRO DE USUARIOS NUEVOS
// ==========================================
router.post('/registro', async (req, res) => {
    const { usr_usuario, usr_clave } = req.body;

    console.log("👉 API RECIBIÓ EN REGISTRO:", { usr_usuario, usr_clave });

    if (!usr_usuario || !usr_clave) {
        return res.status(400).json({ message: 'Por favor, proporcione usuario y contraseña' });
    }

    try {
        // 1. Verificar si el nombre de usuario ya existe
        const [usuarioExistente] = await conmysql.query(
            'SELECT * FROM usuarios WHERE usr_usuario = ?',
            [usr_usuario]
        );

        if (usuarioExistente.length > 0) {
            return res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
        }

        // 2. Encriptar
        const saltRounds = 10;
        const claveEncriptada = await bcrypt.hash(usr_clave, saltRounds);

        // 3. Insertar
        const [result] = await conmysql.query(
            'INSERT INTO usuarios (usr_usuario, usr_clave) VALUES (?, ?)', 
            [usr_usuario, claveEncriptada]
        );

        return res.status(201).json({ 
            message: 'Usuario registrado exitosamente', 
            usr_id: result.insertId 
        });

    } catch (error) {
        console.error("❌ ERROR REAL EN EL TRY/CATCH:", error);
        return res.status(500).json({ message: 'Error interno del servidor al intentar registrar' });
    }
});

export default router;