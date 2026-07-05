import { Router } from 'express';
import multer from 'multer';
import { getProductos, crearProducto, actualizarProducto, eliminarProducto } from '../controladores/productosCtrl.js';

const router = Router();

// 🛡️ NUEVA CONFIGURACIÓN: Almacenamiento en memoria RAM (Impide que Render cree archivos físicos efímeros)
const storage = multer.memoryStorage();

// Filtro para aceptar imágenes y PDFs
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Formato de archivo no permitido. Solo imágenes y PDFs.'), false);
    }
};

const upload = multer({ 
    storage, 
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Límite opcional de 5MB por imagen para cuidar tu base de datos
});

// Endpoints: Interceptamos el POST y PUT con upload.single('prod_imagen')
router.get('/productos', getProductos);

// 'prod_imagen' es el nombre del parámetro que usas desde Ionic
router.post('/productos', upload.single('prod_imagen'), crearProducto);
router.put('/productos/:id', upload.single('prod_imagen'), actualizarProducto);

router.delete('/productos/:id', eliminarProducto);

export default router;