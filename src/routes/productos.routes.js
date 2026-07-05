import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getProductos, crearProducto, actualizarProducto, eliminarProducto } from '../controladores/productosCtrl.js';

const router = Router();

// Directorio en la carpeta temporal de Render para evitar pérdida de imágenes
const uploadDir = '/tmp/uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

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
    limits: { fileSize: 5 * 1024 * 1024 }
});

// Vinculación limpia de endpoints con sus controladores correspondientes
router.get('/productos', getProductos);
router.post('/productos', upload.single('prod_imagen'), crearProducto);
router.put('/productos/:id', upload.single('prod_imagen'), actualizarProducto);
router.delete('/productos/:id', eliminarProducto);

export default router;