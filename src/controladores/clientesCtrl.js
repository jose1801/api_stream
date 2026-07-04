import { conmysql } from '../db.js';

// 1. OBTENER TODOS LOS CLIENTES (Con LEFT JOIN para ver la App asignada)
export const getClientes = async (req, res) => {
    try {
        const query = `
            SELECT c.*, p.nombre AS nombre_producto, p.logo_url 
            FROM clientes c
            LEFT JOIN productos p ON c.producto_id = p.id
            ORDER BY c.created_at DESC
        `;
        const [result] = await conmysql.query(query);
        res.json(result);
    } catch (error) {
        console.error("❌ Error real de MySQL (getClientes):", error);
        return res.status(500).json({ message: 'Error al obtener los clientes' });
    }
};

// 2. OBTENER UN CLIENTE POR SU ID
export const getclientesxid = async (req, res) => {
    try {
        const query = `
            SELECT c.*, p.nombre AS nombre_producto 
            FROM clientes c
            LEFT JOIN productos p ON c.producto_id = p.id 
            WHERE c.id = ?
        `;
        const [result] = await conmysql.query(query, [req.params.id]);
        
        if (result.length <= 0) {
            return res.status(404).json({
                cantidad: 0,
                message: 'No se encontró el cliente'
            });
        }
        
        res.json({
            cantidad: result.length,
            data: result[0]
        });
    } catch (error) {
        console.error("❌ Error real de MySQL (getclientesxid):", error);
        return res.status(500).json({ message: 'Error al obtener el cliente' });
    }
};

// 3. REGISTRAR / INSERTAR UN NUEVO CLIENTE (Auditoría 100% Dinámica)
export const postInsertarClientes = async (req, res) => {
    try {
        const { nombre, telefono, producto_id, descripcion, fecha_vencimiento, operador_auditoria } = req.body;

        if (!nombre || !telefono) {
            return res.status(400).json({ message: 'El nombre y el teléfono son campos requeridos.' });
        }

        const [result] = await conmysql.query(
            'INSERT INTO clientes (nombre, telefono, producto_id, descripcion, fecha_vencimiento) VALUES (?, ?, ?, ?, ?)',
            [nombre, telefono, producto_id || null, descripcion || null, fecha_vencimiento || null]
        );

        // 🌟 Se inserta estrictamente el usuario que mandó el Login de la app
        await conmysql.query(
            'INSERT INTO auditoria (accion, tabla_afectada, usuario, detalles) VALUES (?, ?, ?, ?)',
            ['CREAR_CLIENTE', 'clientes', operador_auditoria, `Se registró al cliente: ${nombre} (Cel: ${telefono})`]
        );

        res.status(201).json({ id: result.insertId, message: 'Cliente insertado exitosamente' });
    } catch (error) {
        console.error("❌ Error real de MySQL (postInsertarClientes):", error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Este número de teléfono ya se encuentra registrado.' });
        }
        return res.status(500).json({ message: 'Error al insertar el cliente' });
    }
};

// 4. ACTUALIZAR CLIENTE COMPLETO (PUT con Auditoría 100% Dinámica)
export const putClientes = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, telefono, producto_id, descripcion, fecha_vencimiento, operador_auditoria } = req.body;

        if (!nombre || !telefono) {
            return res.status(400).json({ message: 'El nombre y el teléfono son requeridos para la actualización.' });
        }

        const [result] = await conmysql.query(
            'UPDATE clientes SET nombre = ?, telefono = ?, producto_id = ?, descripcion = ?, fecha_vencimiento = ? WHERE id = ?',
            [nombre, telefono, producto_id || null, descripcion || null, fecha_vencimiento || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        // 🌟 Se inserta estrictamente el usuario logueado en la modificación
        await conmysql.query(
            'INSERT INTO auditoria (accion, tabla_afectada, usuario, detalles) VALUES (?, ?, ?, ?)',
            ['MODIFICAR_CLIENTE', 'clientes', operador_auditoria, `Se actualizaron los datos del cliente ID #${id}: ${nombre}`]
        );

        res.send({ 
            id: id,
            message: 'Cliente actualizado exitosamente'
        });
    } catch (error) {
        console.error("❌ Error real de MySQL (putClientes):", error);
        return res.status(500).json({ message: 'Error al actualizar the cliente' });
    }
};

// 5. ACTUALIZAR CLIENTE PARCIAL (PATCH con Auditoría 100% Dinámica)
export const patchClientes = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, telefono, producto_id, descripcion, fecha_vencimiento, operador_auditoria } = req.body;
        
        const [result] = await conmysql.query(
            'UPDATE clientes SET nombre = IFNULL(?, nombre), telefono = IFNULL(?, telefono), producto_id = IFNULL(?, producto_id), descripcion = IFNULL(?, descripcion), fecha_vencimiento = IFNULL(?, fecha_vencimiento) WHERE id = ?',
            [nombre, telefono, producto_id, descripcion, fecha_vencimiento || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        await conmysql.query(
            'INSERT INTO auditoria (accion, tabla_afectada, usuario, detalles) VALUES (?, ?, ?, ?)',
            ['PATCH_CLIENTE', 'clientes', operador_auditoria, `Modificación parcial al cliente ID #${id}`]
        );

        res.send({ 
            id: id,
            message: 'Cliente actualizado parcialmente'
        });
    } catch (error) {
        console.error("❌ Error real de MySQL (patchClientes):", error);
        return res.status(500).json({ message: 'Error al actualizar parcialmente el cliente' });
    }
};

// 6. ELIMINAR CLIENTE (Con captura de operador por Query String)
export const deleteClientes = async (req, res) => {
    try {
        const { id } = req.params;
        // 🌟 Capturamos el operador que viaja en la URL (?operador=Pepe)
        const { operador } = req.query; 

        const [cliente] = await conmysql.query('SELECT nombre FROM clientes WHERE id = ?', [id]);
        const nombreCliente = cliente.length > 0 ? cliente[0].nombre : 'Desconocido';

        const [result] = await conmysql.query('DELETE FROM clientes WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }

        // 🌟 Se inserta con total precisión quién presionó el botón de eliminar
        await conmysql.query(
            'INSERT INTO auditoria (accion, tabla_afectada, usuario, detalles) VALUES (?, ?, ?, ?)',
            ['ELIMINAR_CLIENTE', 'clientes', operador, `Se eliminó permanentemente al cliente: ${nombreCliente} (ID #${id})`]
        );

        return res.status(200).json({ message: 'Cliente eliminado exitosamente' });
    } catch (error) {
        console.error("❌ Error real de MySQL (deleteClientes):", error);
        return res.status(500).json({ message: 'Error al eliminar el cliente' });
    }
};

// 7. BUSCAR CLIENTE EN VIVO POR TELÉFONO
export const buscarClientePorCedula = async (req, res) => {
    try {
        const { cedula } = req.params;
        
        const query = `
            SELECT c.*, p.nombre AS nombre_producto 
            FROM clientes c
            LEFT JOIN productos p ON c.producto_id = p.id 
            WHERE c.telefono = ?
        `;
        const [rows] = await conmysql.query(query, [cedula]);

        if (rows.length > 0) {
            const clienteOriginal = rows[0];
            const clienteFormateado = {
                id: clienteOriginal.id,
                nombre: clienteOriginal.nombre,
                telefono: clienteOriginal.telefono,
                producto_id: clienteOriginal.producto_id,
                nombre_producto: clienteOriginal.nombre_producto,
                descripcion: clienteOriginal.descripcion,
                created_at: clienteOriginal.created_at
            };
            return res.json({ encontrado: true, cliente: clienteFormateado });
        } else {
            return res.json({ encontrado: false });
        }
    } catch (error) {
        console.error('❌ Error interno en buscarClientePorCedula:', error);
        return res.status(500).json({ encontrado: false, error: 'Error interno del servidor' });
    }
};