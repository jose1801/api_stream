import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Definimos la ruta en la carpeta /tmp de Render para evitar que se borren con los deploys
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
        cb(new Error('Formato de archivo no permitido.'), false);
    }
};

const upload = multer({ storage, fileFilter });

router.get('/productos', (req, res, next) => next()); // El controlador maneja la lógica
router.post('/productos', upload.single('prod_imagen'), (req, res, next) => next());
router.put('/productos/:id', upload.single('prod_imagen'), (req, res, next) => next());
router.delete('/productos/:id', (req, res, next) => next());

export default router;