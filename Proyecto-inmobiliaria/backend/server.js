require('dotenv').config();
const express = require('express');
const cors = require('cors');
const conectarDB = require('./config/db');

for (const variable of ['JWT_SECRET', 'FRONTEND_URL']) {
    if (!process.env[variable]) {
        console.error(`Falta ${variable} en .env`);
        process.exit(1);
    }
}

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/propiedades', require('./routes/propiedades'));
app.use('/api/usuarios', require('./routes/usuarios'));
const visitas = require('./routes/visitas');
app.use('/api/visitas', visitas);
const arriendos = require('./routes/arriendos');
app.use('/api/arriendos', arriendos);

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

const PORT = process.env.PORT || 3000;
/**
 * Procesos periódicos (cada hora y al arrancar).
 * ponytail: setInterval en el proceso; con más de una instancia del servidor,
 * moverlo a un Scheduled Trigger de Atlas (B18).
 */
async function tareasHorarias() {
    try {
        const canceladas = await visitas.cancelarVisitasVencidas();
        if (canceladas) console.log(`[tareas] ${canceladas} visita(s) pendiente(s) vencida(s) cancelada(s)`);
        const vencidas = await arriendos.vencerArriendos();
        if (vencidas) console.log(`[tareas] ${vencidas} solicitud(es) de arriendo vencida(s)`);
    } catch (err) {
        console.error('[tareas]', err);
    }
}

conectarDB().then(() => {
    app.listen(PORT, () => console.log(`API en http://localhost:${PORT}`));
    tareasHorarias();
    setInterval(tareasHorarias, 60 * 60 * 1000);
});
