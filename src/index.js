import app from './app.js';
import { PORT } from './config.js';

// Aquí solo se queda el cron del correo
import './cron/vencimientos.cron.js';

app.listen(PORT, () => {
    console.log('servidor ejecutando en el puerto', PORT);
});