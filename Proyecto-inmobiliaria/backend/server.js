require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const conectarDB = require('./config/db');
const { ejecutarTareas } = require('./controllers/tareasController');

for (const variable of ['JWT_SECRET', 'FRONTEND_URL']) {
    if (!process.env[variable]) {
        console.error(`Falta ${variable} en .env`);
        process.exit(1);
    }
}

// La conexión se abre al cargar el módulo: así funciona igual con app.listen
// (local) y en Vercel, donde cada instancia importa este archivo sin escuchar un puerto.
const conexion = conectarDB();

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());
// Ninguna ruta responde antes de que MongoDB esté conectado (arranque en frío en Vercel).
app.use(async (_req, _res, next) => {
    await conexion;
    next();
});

/** GET /api/salud — el frontend o un monitor comprueban que la API y MongoDB responden. */
app.get('/api/salud', (_req, res) => {
    const conectada = mongoose.connection.readyState === 1;
    res.status(conectada ? 200 : 503).json({ api: 'ok', mongodb: conectada ? 'conectada' : 'desconectada' });
});

// Cada archivo de routes/ solo declara URLs y permisos; la lógica está en controllers/.
app.use('/api/auth', require('./routes/auth'));
app.use('/api/propiedades', require('./routes/propiedades'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/visitas', require('./routes/visitas'));
app.use('/api/arriendos', require('./routes/arriendos'));
app.use('/api/tareas', require('./routes/tareas'));

app.use((_req, res) => {
    res.status(404).json({ mensaje: 'Ruta no encontrada.' });
});

// Express 5 envía aquí los errores de las rutas async.
app.use((err, _req, res, _next) => {
    // errorHttp (utils/errores.js): error de negocio con su código.
    if (err.status && err.status < 500) {
        return res.status(err.status).json({ mensaje: err.message });
    }
    if (err.name === 'ValidationError' || err.name === 'CastError') {
        return res.status(400).json({ mensaje: 'Datos inválidos: ' + err.message });
    }
    if (err.code === 11000) {
        return res.status(409).json({ mensaje: 'El registro ya existe.' });
    }
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ mensaje: 'JSON inválido.' });
    }
    console.error(err);
    res.status(500).json({ mensaje: 'Error interno del servidor.' });
});

/**
 * Tareas periódicas en local: al arrancar y cada hora. En Vercel no hay un
 * proceso permanente; las ejecuta el Cron de vercel.json (GET /api/tareas).
 */
async function tareasHorarias() {
    try {
        await ejecutarTareas();
    } catch (err) {
        console.error('[tareas]', err);
    }
}

// `node server.js` (npm start / npm run dev) levanta el servidor; Vercel solo importa `app`.
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    conexion.then(() => {
        app.listen(PORT, () => console.log(`API en http://localhost:${PORT}`));
        tareasHorarias();
        setInterval(tareasHorarias, 60 * 60 * 1000);
    });
}

module.exports = app;
