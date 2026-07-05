import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { getProductos, crearProducto, actualizarProducto, eliminarProducto } from '../controladores/productosCtrl.js';

const router = Router();

// ☁️ CONFIGURACIÓN DE CLOUDINARY
cloudinary.config({
    cloud_name: 'rrznyvxu', // <--- Cópialo del dashboard principal de Cloudinary
    api_key: '291649836773752',
    api_secret: 'A6mOHvn7flnRSeFmuE62H2Shhbw'
});

// Vinculamos Multer directamente con Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'plataformas_admin', // Carpeta que se creará en tu nube
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
    },
});

const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

router.get('/productos', getProductos);
router.post('/productos', upload.single('prod_imagen'), crearProducto);
router.put('/productos/:id', upload.single('prod_imagen'), actualizarProducto);
router.delete('/productos/:id', eliminarProducto);

export default router;