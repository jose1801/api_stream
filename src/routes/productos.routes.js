import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { getProductos, crearProducto, actualizarProducto, eliminarProducto } from '../controladores/productosCtrl.js';

const router = Router();

// Configuración de almacenamiento de Multer
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Guarda los archivos en la carpeta src/uploads
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        // Le asigna un nombre único usando la fecha actual
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtro para aceptar imágenes y PDFs
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Formato de archivo no permitido. Solo imágenes y PDFs.'), false);
    }
};

const upload = multer({ storage, fileFilter });

// Endpoints: Interceptamos el POST y PUT con upload.single('prod_imagen')
router.get('/productos', getProductos);

// 'prod_imagen' es el nombre del parámetro que usaremos en Postman
router.post('/productos', upload.single('prod_imagen'), crearProducto);
router.put('/productos/:id', upload.single('prod_imagen'), actualizarProducto);

router.delete('/productos/:id', eliminarProducto);

export default router;