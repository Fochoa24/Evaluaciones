const express = require('express');
const mongoose = require('mongoose');
const Propiedad = require('../models/Propiedad');
const Usuario = require('../models/Usuario');
const Arriendo = require('../models/Arriendo');
const { requiereRol } = require('../middleware/auth');
const {
    ROLES,
    ROLES_ADMIN,
    ESTADOS_ARRIENDO_ACTIVOS,
    ESTADOS_ARRIENDO_NO_FINALIZADOS,
    MOTIVOS_ARRIENDO,
    PLAZO_PROPIETARIO_DIAS_HABILES
} = require('../config/constantes');
const { sumarDiasHabilesFecha } = require('../utils/agenda');
const { enviarCorreo } = require('../utils/correo');
const { errorHttp } = require('../utils/errores');
const { siguienteId } = require('../utils/siguienteId');
const { transicionesArriendo } = require('../utils/permisosArriendo');

/**
 * Solicitudes de arriendo (§3.4, §5.3, RN-06 a RN-10, RN-19): doble
 * aprobación (ejecutivo y luego propietario), reserva en una transacción,
 * vencimiento a los 5 días hábiles y reactivación.
 */
const router = express.Router();

/** §8: el propietario ve nombre, estado y recomendación; sin contacto ni datos financieros. */
const CAMPOS_PROPIETARIO = [
    'id', 'propiedadId', 'propiedadTitulo', 'clienteNombre', 'estado', 'motivo',
    'venceEn', 'respuestaPropietarioEn', 'motivoPropietario', 'createdAt'
];
/** Notas internas del ejecutivo: el cliente no las ve. */
const CAMPOS_INTERNOS = ['observacionesEjecutivo', 'evaluadaPor'];

const fechaLocal = (fecha) => fecha.toLocaleString('es-CL', { timeZone: 'America/Santiago', dateStyle: 'long', timeStyle: 'short' });

/** Solicitudes que ve cada rol (§8). */
async function filtroVisibles(usuario) {
    if (usuario.rol === 'admin') return {};
    if (usuario.rol === 'cliente') return { clienteId: usuario.id };
    const campo = usuario.rol === 'ejecutivo' ? 'ejecutivoId' : 'propietarioId';
    return { propiedadId: { $in: await Propiedad.distinct('id', { [campo]: usuario.id }) } };
}

/** Propiedades de las solicitudes, por id. */
const propiedadesDe = async (arriendos) =>
    new Map((await Propiedad.find({ id: { $in: arriendos.map((a) => a.propiedadId) } })).map((p) => [p.id, p]));

/** Solicitudes tal como las ve `usuario`, con las transiciones que puede hacer. */
async function vistas(arriendos, usuario) {
    const propiedades = await propiedadesDe(arriendos);
    return arriendos.map((a) => {
        let datos = a.toJSON();
        if (usuario.rol === 'propietario') {
            datos = Object.fromEntries(CAMPOS_PROPIETARIO.map((c) => [c, datos[c]]));
        } else if (usuario.rol === 'cliente') {
            CAMPOS_INTERNOS.forEach((c) => delete datos[c]);
        }
        datos.transiciones = transicionesArriendo(a, propiedades.get(a.propiedadId), usuario);
        return datos;
    });
}
const vista = async (arriendo, usuario) => (await vistas([arriendo], usuario))[0];

/** Correo al cliente de la solicitud. */
const avisarCliente = (a, asunto, texto) =>
    enviarCorreo({
        para: a.clienteEmail,
        asunto: `${asunto}: ${a.propiedadTitulo}`,
        texto: `Hola ${a.clienteNombre}:\n\n${texto}\n\nGestión Urbana`
    });

/** Correo a un usuario por id (ejecutivo o propietario), si existe. */
async function avisarUsuario(id, asunto, texto) {
    const u = await Usuario.findOne({ id });
    if (u) await enviarCorreo({ para: u.email, asunto, texto: `Hola ${u.nombre}:\n\n${texto}\n\nGestión Urbana` });
}

/** GET /api/arriendos — las que ve cada rol (§8), más recientes primero. */
router.get('/', requiereRol(ROLES), async (req, res) => {
    const arriendos = await Arriendo.find(await filtroVisibles(req.usuario)).sort('-createdAt');
    res.json(await vistas(arriendos, req.usuario));
});

/**
 * POST /api/arriendos — body: { propiedadId, ingresoMensual, garantia?, antecedentes?, telefono? }.
 * Solo clientes Activo (RN-06); nombre y correo salen de la cuenta (F27).
 */
router.post('/', requiereRol(['cliente']), async (req, res) => {
    const cliente = req.usuario;
    const body = req.body || {};
    const ingresoMensual = Number(body.ingresoMensual);
    if (!(ingresoMensual > 0)) {
        throw errorHttp(400, 'Ingresa un ingreso mensual válido.');
    }

    const propiedad = await Propiedad.findOne({ id: Number(body.propiedadId), estado: 'Publicada' });
    if (!propiedad) {
        throw errorHttp(409, 'Esa propiedad no está recibiendo solicitudes.');
    }
    // RN-07: una activa por cliente y propiedad.
    if (await Arriendo.exists({ propiedadId: propiedad.id, clienteId: cliente.id, estado: { $in: ESTADOS_ARRIENDO_ACTIVOS } })) {
        throw errorHttp(409, 'Ya tienes una solicitud en curso para esta propiedad.');
    }

    const arriendo = await Arriendo.create({
        id: await siguienteId(Arriendo),
        propiedadId: propiedad.id,
        propiedadTitulo: propiedad.titulo,
        clienteId: cliente.id,
        clienteNombre: cliente.nombre,
        clienteEmail: cliente.email,
        clienteTelefono: body.telefono ?? cliente.telefono ?? '',
        ingresoMensual,
        // F26: sin textos de relleno.
        garantia: body.garantia || '',
        antecedentes: body.antecedentes || ''
    });
    res.status(201).json({ mensaje: 'Solicitud enviada. Un ejecutivo la evaluará.', ...(await vista(arriendo, cliente)) });
});

/**
 * POST /api/arriendos/:id/estado — body: { estado, motivo?, observaciones?, motivoPropietario? }.
 * Valida §5.3 y aplica los efectos de cada transición.
 */
router.post('/:id/estado', requiereRol(ROLES), async (req, res) => {
    const actor = req.usuario;
    const { estado: destino, motivo, observaciones, motivoPropietario } = req.body || {};
    const arriendo = await Arriendo.findOne({ id: Number(req.params.id), ...(await filtroVisibles(actor)) });
    if (!arriendo) throw errorHttp(404, 'No se encontró la solicitud.');
    const propiedad = await Propiedad.findOne({ id: arriendo.propiedadId });
    const origen = arriendo.estado;

    if (!transicionesArriendo(arriendo, propiedad, actor).includes(destino)) {
        throw errorHttp(409, `No puedes cambiar la solicitud de ${origen} a ${destino || '(sin estado)'}.`);
    }
    if (typeof observaciones === 'string' && actor.rol !== 'cliente' && actor.rol !== 'propietario') {
        arriendo.observacionesEjecutivo = observaciones.trim();
    }
    const deEjecutivo = ['Esperando propietario', 'Rechazada'].includes(destino) && actor.rol !== 'propietario';
    if (deEjecutivo) {
        if (!motivo || !MOTIVOS_ARRIENDO.includes(motivo)) throw errorHttp(400, 'Elige el motivo de la evaluación.');
        arriendo.motivo = motivo;
    }
    const necesitaPublicada = destino === 'Esperando propietario' || destino === 'Aprobada' || (origen === 'Vencida' && destino === 'Pendiente');
    if (necesitaPublicada && propiedad.estado !== 'Publicada') {
        throw errorHttp(409, `La propiedad está ${propiedad.estado}: no puede avanzar esta solicitud.`);
    }

    let rechazadas = [];
    if (destino === 'Esperando propietario') {
        // Primera aprobación (D8); el plazo del dueño corre desde ahora (RN-19).
        const ahora = new Date();
        arriendo.set({
            estado: destino,
            evaluadaPor: actor.id,
            evaluadaEn: ahora,
            venceEn: sumarDiasHabilesFecha(ahora, PLAZO_PROPIETARIO_DIAS_HABILES)
        });
        await arriendo.save();
    } else if (destino === 'Pendiente') {
        // Reactivar una Vencida: pierde la primera aprobación (§11); RN-07.
        if (await Arriendo.exists({ propiedadId: arriendo.propiedadId, clienteId: arriendo.clienteId, estado: { $in: ESTADOS_ARRIENDO_ACTIVOS } })) {
            throw errorHttp(409, 'Ya tienes otra solicitud en curso para esta propiedad.');
        }
        arriendo.set({ estado: destino, evaluadaPor: null, evaluadaEn: null, venceEn: null, motivo: '', respuestaPropietarioEn: null });
        await arriendo.save();
    } else if (destino === 'Aprobada') {
        // Segunda aprobación (RN-09): reserva y rechaza a los demás postulantes, todo o nada.
        await mongoose.connection.transaction(async (session) => {
            rechazadas = await Arriendo.find(
                { propiedadId: propiedad.id, id: { $ne: arriendo.id }, estado: { $in: ESTADOS_ARRIENDO_NO_FINALIZADOS } },
                null,
                { session }
            );
            await Arriendo.updateMany(
                { id: { $in: rechazadas.map((a) => a.id) } },
                { estado: 'Rechazada', motivo: 'Propiedad reservada para otro postulante' },
                { session }
            );
            arriendo.set({ estado: destino, respuestaPropietarioEn: new Date() });
            await arriendo.save({ session });
            const r = await Propiedad.updateOne({ id: propiedad.id, estado: 'Publicada' }, { estado: 'Reservada' }, { session });
            if (!r.modifiedCount) throw errorHttp(409, 'La propiedad dejó de estar publicada.');
        });
    } else if (origen === 'Aprobada') {
        // Liberar la reserva: la propiedad vuelve al catálogo.
        if (propiedad.estado !== 'Reservada') {
            throw errorHttp(409, `La propiedad está ${propiedad.estado}: para terminar un contrato usa el estado de la propiedad.`);
        }
        await mongoose.connection.transaction(async (session) => {
            arriendo.estado = destino;
            await arriendo.save({ session });
            await Propiedad.updateOne({ id: propiedad.id }, { estado: 'Publicada' }, { session });
        });
    } else {
        if (actor.rol === 'propietario') {
            arriendo.set({ respuestaPropietarioEn: new Date(), motivoPropietario: String(motivoPropietario || '').trim() });
        }
        arriendo.estado = destino;
        await arriendo.save();
    }

    // Correos de los hitos (fase 6).
    if (destino === 'Esperando propietario') {
        await avisarUsuario(propiedad.propietarioId, `Solicitud por responder: ${propiedad.titulo}`,
            `El ejecutivo aprobó la solicitud de ${arriendo.clienteNombre} (${arriendo.motivo}). ` +
            `Tienes hasta el ${fechaLocal(arriendo.venceEn)} para aceptarla o rechazarla en ${process.env.FRONTEND_URL}/arriendos.`);
    }
    if (destino === 'Aprobada') {
        await avisarCliente(arriendo, 'Solicitud aprobada', 'El propietario aprobó tu solicitud y la propiedad quedó reservada para ti. Tu ejecutivo te contactará para firmar el contrato.');
        for (const otra of rechazadas) {
            await avisarCliente(otra, 'Solicitud rechazada', 'La propiedad se reservó para otro postulante. Puedes postular a otras propiedades en nuestro catálogo.');
        }
    }
    if (destino === 'Rechazada') {
        const motivoTexto = actor.rol === 'propietario' ? arriendo.motivoPropietario : arriendo.motivo;
        await avisarCliente(arriendo, 'Solicitud rechazada', `Tu solicitud no fue aprobada${motivoTexto ? `. Motivo: ${motivoTexto}` : ''}.`);
    }
    if (actor.rol === 'propietario') {
        await avisarUsuario(propiedad.ejecutivoId, `El propietario respondió: ${propiedad.titulo}`,
            `El propietario dejó la solicitud de ${arriendo.clienteNombre} como ${destino}` +
            `${rechazadas.length ? `; ${rechazadas.length} solicitud(es) más se rechazaron por la reserva` : ''}.`);
    }

    res.json({ ...(await vista(arriendo, actor)), ...(rechazadas.length && { rechazadas: rechazadas.length }) });
});

/** DELETE /api/arriendos/:id — solo admin (§7). */
router.delete('/:id', requiereRol(ROLES_ADMIN), async (req, res) => {
    const arriendo = await Arriendo.findOne({ id: Number(req.params.id) });
    if (!arriendo) throw errorHttp(404, 'No se encontró la solicitud.');
    if (arriendo.estado === 'Aprobada') {
        throw errorHttp(409, 'Tiene una reserva o contrato vigente: libérala o termina el contrato primero.');
    }
    await arriendo.deleteOne();
    res.status(204).end();
});

/**
 * Proceso horario (RN-19, D15): vence las solicitudes que esperan al dueño
 * con el plazo cumplido. Marca Vencida antes de avisar, para que un fallo
 * de correo no repita el vencimiento.
 * @returns {Promise<number>} Solicitudes vencidas.
 */
async function vencerArriendos() {
    const candidatas = await Arriendo.find({ estado: 'Esperando propietario', venceEn: { $lte: new Date() } });
    let vencidas = 0;
    for (const a of candidatas) {
        const r = await Arriendo.updateOne({ id: a.id, estado: 'Esperando propietario' }, { estado: 'Vencida' });
        if (!r.modifiedCount) continue;
        vencidas++;
        const propiedad = await Propiedad.findOne({ id: a.propiedadId });
        const admins = await Usuario.find({ rol: 'admin', estado: 'Activo' });
        const internos = [...new Set([propiedad?.ejecutivoId, ...admins.map((u) => u.id)].filter(Boolean))];
        for (const id of internos) {
            await avisarUsuario(id, `Solicitud vencida: ${a.propiedadTitulo}`,
                `El propietario no respondió a tiempo la solicitud de ${a.clienteNombre} (n.º ${a.id}). Quedó Vencida.`);
        }
        await avisarCliente(a, 'Solicitud vencida',
            `El propietario no respondió dentro del plazo. Puedes reactivarla en ${process.env.FRONTEND_URL}/arriendos; ` +
            'el ejecutivo la evaluará de nuevo.');
    }
    return vencidas;
}

module.exports = router;
module.exports.vencerArriendos = vencerArriendos;
