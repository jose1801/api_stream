import {Router} from 'express';
import{getClientes,getclientesxid,postInsertarClientes,putClientes,patchClientes,deleteClientes,buscarClientePorCedula}from '../controladores/clientesCtrl.js';
const router = Router();
// armar nuestras rutas
router.get('/clientes',getClientes);
router.get('/clientes/:id',getclientesxid);
router.post('/clientes',postInsertarClientes);
router.put('/clientes/:id',putClientes);
router.patch('/clientes/:id',patchClientes);
router.delete('/clientes/:id',deleteClientes);
// Ruta para buscar un cliente por cédula en vivo en MySQL
router.get('/ventas/cliente/:cedula', buscarClientePorCedula);
export default router;
