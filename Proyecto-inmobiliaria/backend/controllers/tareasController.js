const { cancelarVisitasVencidas } = require('./visitasController');
const { vencerArriendos } = require('./arriendosController');

/**
 * Procesos periódicos (D23, RN-19): cancela las visitas Pendiente cuya hora
 * ya pasó y vence las solicitudes que esperan al propietario fuera de plazo.
 * En local los ejecuta server.js cada hora; en Vercel, el Cron de vercel.json
 * llama a GET /api/tareas.
 * @returns {Promise<{visitasCanceladas: number, arriendosVencidos: number}>}
 */
async function ejecutarTareas() {
    const visitasCanceladas = await cancelarVisitasVencidas();
    if (visitasCanceladas) console.log(`[tareas] ${visitasCanceladas} visita(s) pendiente(s) vencida(s) cancelada(s)`);
    const arriendosVencidos = await vencerArriendos();
    if (arriendosVencidos) console.log(`[tareas] ${arriendosVencidos} solicitud(es) de arriendo vencida(s)`);
    return { visitasCanceladas, arriendosVencidos };
}

/**
 * GET /api/tareas — lo llama Vercel Cron con `Authorization: Bearer <CRON_SECRET>`.
 * Sin CRON_SECRET configurado la ruta queda deshabilitada.
 */
async function ejecutarTareasProgramadas(req, res) {
    const secreto = process.env.CRON_SECRET;
    if (!secreto || req.headers.authorization !== `Bearer ${secreto}`) {
        return res.status(401).json({ mensaje: 'No autorizado.' });
    }
    res.json(await ejecutarTareas());
}

module.exports = { ejecutarTareas, ejecutarTareasProgramadas };
