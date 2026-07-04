import { conmysql as pool } from '../db.js';

// 1. OBTENER PRODUCTOS (Campos Reales)
export const getProductos = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM productos ORDER BY nombre ASC');
        res.json(rows);
    } catch (error) {
        console.error("❌ Error en getProductos:", error);
        return res.status(500).json({ message: 'Error al obtener productos', error: error.message });
    }
};

// 2. CREAR PLATAFORMA / PRODUCTO (Auditoría 100% Dinámica)
export const crearProducto = async (req, res) => {
    try {
        // 🌟 Capturamos 'operador_auditoria' enviado desde el formulario de Ionic
        const { prod_nombre, prod_precio, operador_auditoria } = req.body;
        
        if (!prod_nombre || !prod_precio) {
            return res.status(400).json({ message: 'El nombre y el precio de la app son requeridos.' });
        }

        let imgFinal = 'uploads/placeholder.png'; 
        if (req.file) {
            imgFinal = `uploads/${req.file.filename}`;
        }

        const precioVentaNumerico = parseFloat(prod_precio);
        const stockNumerico = 5; 
        const precioCostoNumerico = 0; 

        if (isNaN(precioVentaNumerico)) {
            return res.status(400).json({ message: 'El precio provisto no es válido.' });
        }

        const query = `
            INSERT INTO productos (nombre, logo_url, precio_costo, precio_venta, stock) 
            VALUES (?, ?, ?, ?, ?)
        `;

        const [result] = await pool.query(query, [
            prod_nombre, 
            imgFinal, 
            precioCostoNumerico, 
            precioVentaNumerico, 
            stockNumerico
        ]);

        // 🌟 AUDITORÍA DINÁMICA: Registra estrictamente el nombre que viene del login
        await pool.query(
            'INSERT INTO auditoria (accion, tabla_afectada, usuario, detalles) VALUES (?, ?, ?, ?)',
            ['CREAR_PRODUCTO', 'productos', operador_auditoria, `Se añadió la plataforma ${prod_nombre} al catálogo por $${precioVentaNumerico}`]
        );

        return res.status(201).json({ 
            id: result.insertId, 
            message: 'Plataforma guardada con éxito en Stream Cipher', 
            url_imagen: imgFinal 
        });

    } catch (error) {
        console.error("❌ Error interno real en crearProducto:", error);
        return res.status(500).json({ message: 'Error al crear producto', error: error.message });
    }
};

// 3. ACTUALIZAR PRODUCTO (Auditoría 100% Dinámica)
export const actualizarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        // 🌟 Capturamos 'operador_auditoria' enviado desde el formulario de Ionic
        const { prod_nombre, prod_precio, operador_auditoria } = req.body;
        
        const [existe] = await pool.query('SELECT logo_url, nombre FROM productos WHERE id = ?', [id]);
        if (existe.length === 0) return res.status(404).json({ message: 'Producto no encontrado' });

        let imgFinal = existe[0].logo_url; 
        if (req.file) {
            imgFinal = `uploads/${req.file.filename}`;
        }

        const precioVentaNumerico = prod_precio ? parseFloat(prod_precio) : existe[0].precio_venta;

        const query = `
            UPDATE productos 
            SET nombre = ?, precio_venta = ?, logo_url = ? 
            WHERE id = ?
        `;

        await pool.query(query, [
            prod_nombre || existe[0].nombre, 
            precioVentaNumerico, 
            imgFinal, 
            id
        ]);
        
        // 🌟 AUDITORÍA DINÁMICA: Registra estrictamente el usuario activo que modificó
        await pool.query(
            'INSERT INTO auditoria (accion, tabla_afectada, usuario, detalles) VALUES (?, ?, ?, ?)',
            ['MODIFICAR_PRODUCTO', 'productos', operador_auditoria, `Se editó la plataforma: ${existe[0].nombre} (ID #${id})`]
        );

        res.json({ message: 'Producto actualizado con éxito', url_imagen: imgFinal });
    } catch (error) {
        console.error("❌ Error en actualizarProducto:", error);
        return res.status(500).json({ message: 'Error al actualizar producto', error: error.message });
    }
};

// 4. ELIMINAR PRODUCTO (Auditoría 100% Dinámica usando Query string)
export const eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        // 🌟 Atrapamos el operador que viaja en la URL (?operador=Pepe) desde Ionic
        const { operador } = req.query; 

        const [prod] = await pool.query('SELECT nombre FROM productos WHERE id = ?', [id]);
        const nombreProd = prod.length > 0 ? prod[0].nombre : 'Desconocido';

        await pool.query('DELETE FROM productos WHERE id = ?', [id]);

        // 🌟 AUDITORÍA DINÁMICA: Inserción directa y limpia del nombre correspondiente
        await pool.query(
            'INSERT INTO auditoria (accion, tabla_afectada, usuario, detalles) VALUES (?, ?, ?, ?)',
            ['ELIMINAR_PRODUCTO', 'productos', operador, `Se eliminó físicamente la plataforma: ${nombreProd} (ID #${id})`]
        );

        res.json({ message: 'Producto eliminado físicamente de la base de datos' });
    } catch (error) {
        console.error("❌ Error en eliminarProducto:", error);
        return res.status(500).json({ message: 'Error al eliminar producto', error: error.message });
    }
};