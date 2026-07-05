import { conmysql as pool } from '../db.js';

export const getProductos = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM productos ORDER BY nombre ASC');
        res.json(rows);
    } catch (error) {
        console.error("❌ Error en getProductos:", error);
        return res.status(500).json({ message: 'Error al obtener productos', error: error.message });
    }
};

export const crearProducto = async (req, res) => {
    try {
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
            ['CREAR_PRODUCTO', 'productos', operador_auditoria, `Se añadió la plataforma ${prod_nombre} por $${precioVentaNumerico}`]
        );

        return res.status(201).json({ id: result.insertId, url_imagen: imgFinal });
    } catch (error) {
        console.error("❌ Error en crearProducto:", error);
        return res.status(500).json({ message: 'Error al crear producto' });
    }
};

export const actualizarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { prod_nombre, prod_precio, operador_auditoria } = req.body;
        
        const [existe] = await pool.query('SELECT logo_url, nombre FROM productos WHERE id = ?', [id]);
        if (existe.length === 0) return res.status(404).json({ message: 'Producto no encontrado' });

        let imgFinal = existe[0].logo_url; 
        if (req.file) {
            imgFinal = `uploads/${req.file.filename}`;
        }

        const precioVentaNumerico = prod_precio ? parseFloat(prod_precio) : existe[0].precio_venta;

        const query = `
            UPDATE productos SET nombre = ?, precio_venta = ?, logo_url = ? WHERE id = ?
        `;

        await pool.query(query, [
            prod_nombre || existe[0].nombre, 
            precioVentaNumerico, 
            imgFinal, 
            id
        ]);
        
        await pool.query(
            'INSERT INTO auditoria (accion, tabla_afectada, usuario, detalles) VALUES (?, ?, ?, ?)',
            ['MODIFICAR_PRODUCTO', 'productos', operador_auditoria, `Se editó la plataforma: ${existe[0].nombre}`]
        );

        res.json({ message: 'Producto actualizado con éxito', url_imagen: imgFinal });
    } catch (error) {
        return res.status(500).json({ message: 'Error al actualizar producto' });
    }
};

export const eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { operador } = req.query; 

        const [prod] = await pool.query('SELECT nombre FROM productos WHERE id = ?', [id]);
        const nombreProd = prod.length > 0 ? prod[0].nombre : 'Desconocido';

        await pool.query('DELETE FROM productos WHERE id = ?', [id]);

        await pool.query(
            'INSERT INTO auditoria (accion, tabla_afectada, usuario, detalles) VALUES (?, ?, ?, ?)',
            ['ELIMINAR_PRODUCTO', 'productos', operador, `Se eliminó la plataforma: ${nombreProd}`]
        );

        res.json({ message: 'Producto eliminado' });
    } catch (error) {
        return res.status(500).json({ message: 'Error al eliminar producto' });
    }
};