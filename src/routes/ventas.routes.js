import express from 'express';
// 🌟 CORRECCIÓN ES MODULES: Importamos la función específica y añadimos el '.js' obligatorio
import { procesarNuevaVenta } from '../controladores/ventasCtrl.js'; 

const router = express.Router();

// Definimos el endpoint POST que consumirá Ionic
router.post('/procesar', procesarNuevaVenta);

// 🌟 CORRECCIÓN ES MODULES: Reemplazamos module.exports por export default
export default router;