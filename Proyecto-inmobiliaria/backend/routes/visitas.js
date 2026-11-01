const express = require('express');
const mongoose = require('mongoose');
const Propiedad = require('../models/Propiedad');
const Usuario = require('../models/Usuario');
const Visita = require('../models/Visita');
const { requiereRol, sesionOpcional } = require('../middleware/auth');
const { ROLES, ROLES_ADMIN, ROLES_INTERNOS, ESTADOS_VISITA_ACTIVOS, RESULTADOS_VISITA } = require('../config/constantes');
const { ahoraChile, validarHorario, buscarChoque, yaOcurrio, transicionesVisita } = require('../utils/agenda');
const { enviarCorreo } = require('../utils/correo');
const { errorHttp } = require('../utils/errores');
const { siguienteId } = require('../utils/siguienteId');

/**
 * Visitas (§3.3, §5.2, RN-01 a RN-05): agenda con choques por propiedad y
 * por ejecutivo, validada en el servidor dentro de una transacción.
 */
const router = express.Router();

/** Lo que el propietario ve de las visitas a sus propiedades (§8: sin contacto). */
const CAMPOS_PROPIETARIO = ['id', 'propiedadId', 'propiedadTitulo', 'fecha', 'hora', 'estado', 'resultado'];

/** Visitas que ve cada rol (§8). */
async function filtroVisibles(usuario) {
    if (usuario.rol === 'admin') return {};
    if (usuario.rol === 'ejecutivo') return { ejecutivoId: usuario.id };
    if (usuario.rol === 'cliente') return { clienteId: usuario.id };
    return { propiedadId: { $in: await Propiedad.distinct('id', { propietarioId: usuario.id }) } };
}

/** Visitas tal como las ve `usuario`, con el ejecutivo y las acciones que puede hacer. */
async function vistas(visitas, usuario) {
    const nombres = new Map(
        (await Usuario.find({ id: { $in: visitas.map((v) => v.ejecutivoId) } }, 'id nombre')).map((u) => [u.id, u.nombre])
    );
    return visitas.map((v) => {
        let datos = v.toJSON();
        if (usuario.rol === 'propietario') {
            datos = Object.fromEntries(CAMPOS_PROPIETARIO.map((c) => [c, datos[c]]));
        }
        datos.ejecutivoNombre = nombres.get(v.ejecutivoId) || '';
        datos.transiciones = transicionesVisita(v, usuario);
        datos.puedeReprogramar = datos.transiciones.includes('Cancelada') && usuario.rol !== 'cliente';
        return datos;
    });
}

/** Visita `:id` si el usuario puede verla; si no, 404. */
async function cargarVisible(req) {
    const visita = await Visita.findOne({ id: Number(req.params.id), ...(await filtroVisibles(req.usuario)) });
    if (!visita) throw errorHttp(404, 'No se encontró la visita.');
    return visita;
}

/**
 * RN-05: dentro de la transacción, revisa que `visita` no choque con otra
 * activa del día. Antes "toca" al ejecutivo: dos agendamientos simultáneos
 * del mismo ejecutivo chocan en ese documento y la transacción se reintenta,
 * así el segundo ya ve al primero. Cubre también RN-03, porque todas las
 * visitas activas de una propiedad son de su ejecutivo responsable.
 */
async function exigirSinChoque(visita, session) {
    await Usuario.updateOne({ id: visita.ejecutivoId }, { $currentDate: { updatedAt: true } }, { session });
    const otras = await Visita.find(
        {
            fecha: visita.fecha,
            estado: { $in: ESTADOS_VISITA_ACTIVOS },
            $or: [{ propiedadId: visita.propiedadId }, { ejecutivoId: visita.ejecutivoId }]
        },
        null,
        { session }
    );
    const choque = buscarChoque(visita, otras);
    if (choque) {
        throw errorHttp(409, choque.propiedadId === visita.propiedadId
            ? `Ya hay una visita en esta propiedad a las ${choque.hora}. Elige otro horario.`
            : `El ejecutivo tiene otra visita a las ${choque.hora} y necesita tiempo de traslado. Elige otro horario.`);
    }
}

/** Correo a quien pidió la visita (D18: la dirección solo va al confirmar). */
async function avisar(visita, asunto, texto) {
    await enviarCorreo({
        para: visita.email,
        asunto: `${asunto}: ${visita.propiedadTitulo}`,
        texto: `Hola ${visita.nombre}:\n\n${texto}\n\nGestión Urbana`
    });
}

/** GET /api/visitas — las que ve cada rol (§8), más recientes primero. */
router.get('/', requiereRol(ROLES), async (req, res) => {
    const visitas = await Visita.find(await filtroVisibles(req.usuario)).sort({ fecha: -1, hora: -1 });
    res.json(await vistas(visitas, req.usuario));
});

/**
 * POST /api/visitas — body: { propiedadId, nombre, email, telefono?, fecha, hora, comentarios? }.
 * Sin cuenta (D7) o con ella; el cliente agenda con los datos de su cuenta.
 */
router.post('/', sesionOpcional(), async (req, res) => {
    const actor = req.usuario;
    const body = req.body || {};
    if (actor?.rol === 'propietario') {
        throw errorHttp(403, 'Los propietarios no agendan visitas.');
    }
    if (actor && actor.estado !== 'Activo') {
        throw errorHttp(403, 'Tu cuenta aún no está activa.');
    }
    const cliente = actor?.rol === 'cliente' ? actor : null;
    const contacto = cliente
        ? { nombre: cliente.nombre, email: cliente.email, telefono: body.telefono || cliente.telefono || '' }
        : { nombre: body.nombre, email: body.email, telefono: body.telefono || '' };
    if (!String(contacto.nombre || '').trim() || !String(contacto.email || '').trim()) {
        throw errorHttp(400, 'Indica tu nombre y correo.');
    }

    // RN-02: Publicada, con dueño y ejecutivo activos.
    const propiedad = await Propiedad.findOne({ id: Number(body.propiedadId), estado: 'Publicada' });
    const activos = propiedad && await Usuario.countDocuments({
        id: { $in: [propiedad.propietarioId, propiedad.ejecutivoId] },
        estado: 'Activo'
    });
    if (activos !== 2) {
        throw errorHttp(409, 'Esta propiedad no está recibiendo visitas.');
    }

    const interno = ROLES_INTERNOS.includes(actor?.rol);
    const motivo = validarHorario(body.fecha, body.hora, { interno, ahora: ahoraChile() });
    if (motivo) throw errorHttp(400, motivo);

    const email = String(contacto.email).trim().toLowerCase();
    const repetida = await Visita.exists({
        propiedadId: propiedad.id,
        email,
        estado: { $in: ESTADOS_VISITA_ACTIVOS }
    });
    if (repetida) {
        throw errorHttp(409, 'Ya tienes una visita pendiente o confirmada en esta propiedad.');
    }

    const visita = new Visita({
        ...contacto,
        email,
        propiedadId: propiedad.id,
        propiedadTitulo: propiedad.titulo,
        ejecutivoId: propiedad.ejecutivoId,
        clienteId: cliente?.id ?? null,
        fecha: body.fecha,
        hora: body.hora,
        comentarios: body.comentarios || ''
    });
    await mongoose.connection.transaction(async (session) => {
        await exigirSinChoque(visita, session);
        // Dentro de la transacción: dos altas simultáneas no se quedan con el mismo id.
        visita.id = await siguienteId(Visita, session);
        await visita.save({ session });
    });

    res.status(201).json({
        mensaje: 'Solicitud de visita registrada. Te avisaremos por correo cuando el ejecutivo la confirme.',
        ...(actor ? (await vistas([visita], actor))[0] : { id: visita.id })
    });
});

/**
 * POST /api/visitas/:id/estado — body: { estado, resultado? }. Valida §5.2;
 * confirmar revalida choques (RN-05) y envía la dirección; Realizada exige
 * resultado y que la hora ya haya pasado.
 */
router.post('/:id/estado', requiereRol(ROLES), async (req, res) => {
    const actor = req.usuario;
    const { estado: destino, resultado = '' } = req.body || {};
    const visita = await cargarVisible(req);

    if (!transicionesVisita(visita, actor).includes(destino)) {
        throw errorHttp(409, `No puedes cambiar la visita de ${visita.estado} a ${destino || '(sin estado)'}.`);
    }
    if (destino === 'Confirmada' && yaOcurrio(visita, ahoraChile())) {
        throw errorHttp(409, 'El horario de esta visita ya pasó: reprográmala antes de confirmar.');
    }
    if (destino === 'Realizada') {
        if (!resultado || !RESULTADOS_VISITA.includes(resultado)) {
            throw errorHttp(400, 'Indica el resultado de la visita.');
        }
        if (!yaOcurrio(visita, ahoraChile())) {
            throw errorHttp(409, 'La visita aún no ocurre.');
        }
        visita.resultado = resultado;
    }

    visita.estado = destino;
    if (destino === 'Confirmada') {
        visita.reasignada = false;
        await mongoose.connection.transaction(async (session) => {
            await exigirSinChoque(visita, session);
            await visita.save({ session });
        });
        const propiedad = await Propiedad.findOne({ id: visita.propiedadId });
        const ejecutivo = await Usuario.findOne({ id: visita.ejecutivoId });
        await avisar(visita, 'Visita confirmada', [
            `Tu visita quedó confirmada para el ${visita.fecha} a las ${visita.hora}.`,
            `Dirección: ${propiedad.direccion || 'te la enviará el ejecutivo'} (${propiedad.comuna}).`,
            `Te atenderá ${ejecutivo?.nombre || 'un ejecutivo'}${ejecutivo?.telefono ? ` (${ejecutivo.telefono})` : ''}.`
        ].join('\n'));
    } else {
        await visita.save();
        if (destino === 'Rechazada' || (destino === 'Cancelada' && actor.rol !== 'cliente')) {
            await avisar(visita, `Visita ${destino.toLowerCase()}`,
                `Tu visita del ${visita.fecha} a las ${visita.hora} fue ${destino.toLowerCase()}. Puedes agendar otro horario en nuestro sitio.`);
        }
    }

    res.json((await vistas([visita], actor))[0]);
});

/** PATCH /api/visitas/:id — body: { fecha, hora }. Reprograma (ejecutivo asignado o admin). */
router.patch('/:id', requiereRol(ROLES_INTERNOS), async (req, res) => {
    const actor = req.usuario;
    const visita = await cargarVisible(req);
    const { fecha, hora } = req.body || {};
    if (!transicionesVisita(visita, actor).includes('Cancelada')) {
        throw errorHttp(409, `No puedes reprogramar una visita ${visita.estado}.`);
    }
    const motivo = validarHorario(fecha, hora, { interno: true, ahora: ahoraChile() });
    if (motivo) throw errorHttp(400, motivo);

    visita.set({ fecha, hora });
    await mongoose.connection.transaction(async (session) => {
        await exigirSinChoque(visita, session);
        await visita.save({ session });
    });
    await avisar(visita, 'Visita reprogramada',
        `Tu visita se movió al ${fecha} a las ${hora}. Estado: ${visita.estado}.`);

    res.json((await vistas([visita], actor))[0]);
});

/** DELETE /api/visitas/:id — solo admin (§7). */
router.delete('/:id', requiereRol(ROLES_ADMIN), async (req, res) => {
    await (await cargarVisible(req)).deleteOne();
    res.status(204).end();
});

/**
 * Proceso horario: las visitas Pendiente cuya hora ya pasó sin que nadie
 * las confirmara se cancelan, para no bloquear la agenda (fase 5).
 * @returns {Promise<number>} Visitas canceladas.
 */
async function cancelarVisitasVencidas() {
    const { fecha, hora } = ahoraChile();
    const r = await Visita.updateMany(
        { estado: 'Pendiente', $or: [{ fecha: { $lt: fecha } }, { fecha, hora: { $lte: hora } }] },
        { estado: 'Cancelada' }
    );
    return r.modifiedCount;
}

module.exports = router;
module.exports.cancelarVisitasVencidas = cancelarVisitasVencidas;
