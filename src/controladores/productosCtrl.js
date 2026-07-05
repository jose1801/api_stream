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

// 2. CREAR PLATAFORMA / PRODUCTO (Auditoría 100% Dinámica con Almacenamiento en Base64)
export const crearProducto = async (req, res) => {
    try {
        const { prod_nombre, prod_precio, operador_auditoria } = req.body;
        
        if (!prod_nombre || !prod_precio) {
            return res.status(400).json({ message: 'El nombre y el precio de la app son requeridos.' });
        }

        // Definimos imagen por defecto
        let imgFinal = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=150'; 
        
        // 🛡️ SI EL CELULAR ENVÍA UNA FOTO: La transformamos a Base64 para guardarla directamente en Aiven
        if (req.file) {
            const base64String = req.file.buffer.toString('base64');
            imgFinal = `data:${req.file.mimetype};base64,${base64String}`;
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

// 3. ACTUALIZAR PRODUCTO (Auditoría 100% Dinámica con Almacenamiento en Base64)
export const actualizarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { prod_nombre, prod_precio, operador_auditoria } = req.body;
        
        const [existe] = await pool.query('SELECT logo_url, nombre FROM productos WHERE id = ?', [id]);
        if (existe.length === 0) return res.status(404).json({ message: 'Producto no encontrado' });

        let imgFinal = existe[0].logo_url; 
        
        // 🛡️ SI SE CARGA UNA NUEVA FOTO EN EDICIÓN: La transformamos a Base64
        if (req.file) {
            const base64String = req.file.buffer.toString('base64');
            imgFinal = `data:${req.file.mimetype};base64,${base64String}`;
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

// 4. ELIMINAR PRODUCTO
export const eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { operador } = req.query; 

        const [prod] = await pool.query('SELECT nombre FROM productos WHERE id = ?', [id]);
        const nombreProd = prod.length > 0 ? prod[0].nombre : 'Desconocido';

        await pool.query('DELETE FROM productos WHERE id = ?', [id]);

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