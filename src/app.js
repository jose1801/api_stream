import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import clientesRoutes from './routes/clientes.routes.js';
import productosRoutes from './routes/productos.routes.js'; 
import authRoutes from './routes/auth.routes.js';
import { verifyToken } from './jwt.middleware.js';
import rutaVentas from './routes/ventas.routes.js'; 
import auditoriaRoutes from './routes/auditoria.routes.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Asegura la creación de la carpeta uploads en la ruta correcta
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const corsOptions = {
    origin: '*', 
    methods: ['GET','POST','PUT','PATCH','DELETE'], 
    credentials: true    
}

app.use(cors(corsOptions));
app.use(express.json());

// Servir la carpeta uploads como estática
app.use('/uploads', express.static(uploadDir));

// =============== RUTAS ===============

// 1️⃣ RUTAS PÚBLICAS (Desbloqueadas para pruebas en Ionic)
app.use('/api/auth', authRoutes);
app.use('/api/ventas', rutaVentas); 
app.use('/api', productosRoutes);
app.use('/api', clientesRoutes); // 🌟 MOVIDO AQUÍ: Ahora es pública y corregirá el error 403 Forbidden al modificar
app.use('/api', auditoriaRoutes);
// 2️⃣ RUTAS PROTEGIDAS 
// (Si en el futuro deseas proteger algo con verifyToken, lo pones aquí abajo)

// ... Todo tu código anterior de app.js se queda exactamente igual ...

app.use((req,res,next)=>{
    res.status(404).json({
        message:"endpoint no encontrado"
    })
})

// 🛡️ COPIA Y PEGA ESTO AQUÍ (Manejador Global de Errores definitivo):
app.use((err, req, res, next) => {
    console.error("💥 CLOUDINARY/MULTER ERROR DETECTADO:");
    console.error("📝 Mensaje del fallo:", err.message);
    console.error("🗂️ Detalle técnico (Stack):", err.stack);
    
    return res.status(500).json({
        message: "Error interno en el servidor de imágenes",
        error: err.message
    });
});

export default app;