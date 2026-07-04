import pool from '../db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'; // 🌟 Importamos bcrypt para la seguridad obligatoria

// 1. NUEVO ENDPOINT PARA REGISTRAR USUARIOS (Encriptación Obligatoria)
export const registro = async (req, res) => {
  const { username, password, nombre, rol } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Usuario y contraseña son requeridos.' });
    }

    // 🛡️ ENCRIPTACIÓN OBLIGATORIA: Generamos el Hash seguro
    const saltRounds = 10;
    const claveCifrada = await bcrypt.hash(password, saltRounds);

    // Insertamos en tu MySQL usando tus columnas reales: usr_usuario y usr_clave
    const query = 'INSERT INTO usuarios (usr_usuario, usr_clave, nombre, rol) VALUES (?, ?, ?, ?)';
    const [result] = await pool.query(query, [username, claveCifrada, nombre || username, rol || 'empleado']);

    return res.status(201).json({
      success: true,
      message: '¡Usuario registrado y contraseña encriptada con éxito!',
      id: result.insertId
    });

  } catch (error) {
    console.error('❌ Error al registrar usuario:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Este nombre de usuario ya existe.' });
    }
    return res.status(500).json({ success: false, message: 'Error interno al registrar usuario.' });
  }
};

// 2. LOGIN ACTUALIZADO (Comparación Dinámica de Hashes)
export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Buscar usando tu columna real: usr_usuario
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE usr_usuario = ?', [username]);

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'El usuario no se encuentra registrado.'
      });
    }

    const usuario = rows[0];

    // 🛡️ VALIDACIÓN DE CONTRASEÑA ENCRIPTADA
    // Compara el texto plano del formulario contra el Hash seguro de la base de datos (usr_clave)
    const contraseñaValida = await bcrypt.compare(password, usuario.usr_clave);

    if (!contraseñaValida) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña incorrecta. Inténtalo de nuevo.'
      });
    }

    // 3. Generar el Token JWT (Válido por 24 horas)
    const secretKey = process.env.JWT_SECRET || 'llave_secreta_stream_cipher';
    const token = jwt.sign(
      { id: usuario.usr_id, nombre: usuario.nombre, rol: usuario.rol },
      secretKey,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      message: '¡Bienvenido al sistema!',
      token,
      usuario: {
        nombre: usuario.nombre,
        username: usuario.usr_usuario,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error('❌ Error en el login:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno en el servidor de autenticación.'
    });
  }
};