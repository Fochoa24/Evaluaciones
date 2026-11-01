const express = require('express');
const mongoose = require('mongoose');
const Propiedad = require('../models/Propiedad');
const Usuario = require('../models/Usuario');
const Visita = require('../models/Visita');
const Arriendo = require('../models/Arriendo');
const { requiereRol, sesionOpcional } = require('../middleware/auth');
const { ROLES_GESTION, ROLES_ADMIN, ROLES_INTERNOS, ESTADOS_PUBLICOS, ESTADOS_VISITA_ACTIVOS } = require('../config/constantes');
const { ahoraChile, rangoAgenda, validarHorario, bloquesLibres } = require('../utils/agenda');
const { cancelarPendientes, traspasarPropiedad } = require('../utils/cascadas');
const { errorHttp } = require('../utils/errores');
const {
    COMPROMETIDAS,
    nivelSobre,
    puedeVerCompleta,
    puedeEditar,
    transicionesPermitidas
} = require('../utils/permisosPropiedad');
const { ejecutivoConMenorCarga } = require('../utils/reasignacion');
const { siguienteId } = require('../utils/siguienteId');

/**
 * Propiedades (§3.2, §5.1, §8 de docs/modelo-logico.md): catálogo según
 * quién mira, alta, edición, cambios de estado con sus efectos y borrado.
 */
const router = express.Router();

/** Datos del formulario. Estado, dueño y ejecutivo se cambian por sus propias reglas. */
const CAMPOS_DATOS = [
    'titulo', 'tipo', 'comuna', 'direccion', 'ubicacion', 'precioMensual', 'gastosComunes',
    'superficie', 'dormitorios', 'banos', 'estacionamientos', 'caracteristicas', 'imagen'
];

/** Solo los CAMPOS_DATOS presentes en el body (lista blanca). */
const datosDelBody = (body = {}) =>
    Object.fromEntries(CAMPOS_DATOS.filter((c) => body[c] !== undefined).map((c) => [c, body[c]]));

/** Qué ve cada uno: público y clientes, las públicas; propietario, además las suyas; internos, todas. */
function filtroVisibles(usuario) {
    if (usuario && ROLES_INTERNOS.includes(usuario.rol)) return {};
    const publicas = { estado: { $in: ESTADOS_PUBLICOS } };
    return usuario?.rol === 'propietario' ? { $or: [publicas, { propietarioId: usuario.id }] } : publicas;
}

/**
 * Propiedades tal como las ve `usuario`: todas con el nombre del ejecutivo
 * de contacto; dirección y dueño solo para internos y el dueño (D5); la
 * dirección también para el cliente con una visita Confirmada (D18); y
 * `puedeEditar` y `transiciones` para que el frontend muestre las acciones
 * sin repetir las reglas.
 */
async function vistas(propiedades, usuario) {
    const ids = [...new Set(propiedades.flatMap((p) => [p.ejecutivoId, p.propietarioId]))];
    const nombres = new Map(
        (await Usuario.find({ id: { $in: ids } }, 'id nombre')).map((u) => [u.id, u.nombre])
    );
    const conVisita = new Set(usuario?.rol === 'cliente'
        ? await Visita.distinct('propiedadId', { clienteId: usuario.id, estado: 'Confirmada' })
        : []);
    return propiedades.map((p) => {
        const datos = p.toJSON();
        datos.ejecutivoNombre = nombres.get(p.ejecutivoId) || '';
        if (puedeVerCompleta(p, usuario)) {
            datos.propietarioNombre = nombres.get(p.propietarioId) || '';
        } else {
            if (!conVisita.has(p.id)) delete datos.direccion;
            delete datos.propietarioId;
        }
        datos.puedeEditar = puedeEditar(p, usuario);
        datos.transiciones = transicionesPermitidas(p, usuario);
        return datos;
    });
}
const vista = async (propiedad, usuario) => (await vistas([propiedad], usuario))[0];

/** Propiedad `:id` si el usuario puede verla; si no, 404 (no revela que existe). */
async function cargarVisible(req) {
    const propiedad = await Propiedad.findOne({ id: Number(req.params.id), ...filtroVisibles(req.usuario) });
    if (!propiedad) {
        throw errorHttp(404, 'No se encontró la propiedad solicitada.');
    }
    return propiedad;
}

/** Exige que `id` sea un usuario Activo con ese rol (RN-11). */
async function usuarioActivo(id, rol) {
    if (!(await Usuario.exists({ id: Number(id), rol, estado: 'Activo' }))) {
        throw errorHttp(400, `El ${rol} indicado no existe o no está activo.`);
    }
    return Number(id);
}

/** GET /api/propiedades — catálogo según quién mira (los filtros de búsqueda se aplican en el frontend). */
router.get('/', sesionOpcional(), async (req, res) => {
    const propiedades = await Propiedad.find(filtroVisibles(req.usuario)).sort('id');
    res.json(await vistas(propiedades, req.usuario));
});

/** GET /api/propiedades/:id */
router.get('/:id', sesionOpcional(), async (req, res) => {
    res.json(await vista(await cargarVisible(req), req.usuario));
});

/**
 * GET /api/propiedades/:id/horarios?fecha=YYYY-MM-DD — rango agendable y, si
 * se indica fecha, los bloques libres de ese día (RN-01 a RN-04), para que el
 * formulario ofrezca solo horarios válidos. El servidor revalida al agendar.
 */
router.get('/:id/horarios', sesionOpcional(), async (req, res) => {
    const propiedad = await cargarVisible(req);
    const interno = ROLES_INTERNOS.includes(req.usuario?.rol);
    const ahora = ahoraChile();
    const { fecha } = req.query;
    const respuesta = rangoAgenda(ahora.fecha, interno);
    if (propiedad.estado !== 'Publicada' || !fecha) {
        return res.json({ ...respuesta, bloques: [] });
    }
    const otras = await Visita.find({
        fecha,
        estado: { $in: ESTADOS_VISITA_ACTIVOS },
        $or: [{ propiedadId: propiedad.id }, { ejecutivoId: propiedad.ejecutivoId }]
    });
    const bloques = bloquesLibres({ propiedadId: propiedad.id, ejecutivoId: propiedad.ejecutivoId, fecha }, otras)
        .filter((hora) => !validarHorario(fecha, hora, { interno, ahora }));
    res.json({ ...respuesta, fecha, bloques });
});

/**
 * POST /api/propiedades — datos del formulario (+ propietarioId para internos,
 * + ejecutivoId opcional para el admin). Siempre nace Disponible (D9).
 */
router.post('/', requiereRol(ROLES_GESTION), async (req, res) => {
    const actor = req.usuario;
    const { propietarioId, ejecutivoId } = req.body || {};
    let dueno = actor.id;
    let responsable = actor.id;

    if (actor.rol === 'propietario') {
        responsable = await ejecutivoConMenorCarga(); // RN-12
    } else {
        if (!propietarioId) {
            throw errorHttp(400, 'Indica el propietario de la propiedad.');
        }
        dueno = await usuarioActivo(propietarioId, 'propietario');
        if (actor.rol === 'admin') {
            responsable = ejecutivoId ? await usuarioActivo(ejecutivoId, 'ejecutivo') : await ejecutivoConMenorCarga();
        }
    }

    const nueva = await Propiedad.create({
        ...datosDelBody(req.body),
        id: await siguienteId(Propiedad),
        estado: 'Disponible',
        propietarioId: dueno,
        ejecutivoId: responsable
    });
    res.status(201).json(await vista(nueva, actor));
});

/**
 * PATCH /api/propiedades/:id — datos del formulario; el admin además puede
 * reasignar propietarioId o ejecutivoId. Si el dueño cambia un aviso
 * Publicada, vuelve a Disponible hasta que el ejecutivo lo publique de nuevo.
 */
router.patch('/:id', requiereRol(ROLES_GESTION), async (req, res) => {
    const actor = req.usuario;
    const propiedad = await cargarVisible(req);
    if (!puedeEditar(propiedad, actor)) {
        const comprometida = nivelSobre(propiedad, actor) === 'gestion' && COMPROMETIDAS.includes(propiedad.estado);
        throw errorHttp(403, comprometida
            ? `La propiedad está ${propiedad.estado}: solo el ejecutivo responsable puede editarla.`
            : 'No puedes editar esta propiedad.');
    }

    const { propietarioId, ejecutivoId } = req.body || {};
    const nuevoDueno = propietarioId !== undefined && Number(propietarioId) !== propiedad.propietarioId;
    const nuevoEjecutivo = ejecutivoId !== undefined && Number(ejecutivoId) !== propiedad.ejecutivoId;
    if ((nuevoDueno || nuevoEjecutivo) && actor.rol !== 'admin') {
        throw errorHttp(403, 'Solo un administrador reasigna el propietario o el ejecutivo.');
    }

    propiedad.set(datosDelBody(req.body));
    // modifiedPaths ignora los campos reenviados sin cambios.
    const volvioARevision =
        actor.rol === 'propietario' && propiedad.estado === 'Publicada' && propiedad.modifiedPaths().length > 0;
    if (volvioARevision) propiedad.estado = 'Disponible';
    if (nuevoDueno) propiedad.propietarioId = await usuarioActivo(propietarioId, 'propietario');
    const haciaEjecutivo = nuevoEjecutivo ? await usuarioActivo(ejecutivoId, 'ejecutivo') : null;

    let traspaso;
    await mongoose.connection.transaction(async (session) => {
        await propiedad.save({ session });
        if (haciaEjecutivo) {
            traspaso = await traspasarPropiedad(propiedad.id, propiedad.ejecutivoId, haciaEjecutivo, session);
        }
    });
    if (haciaEjecutivo) propiedad.ejecutivoId = haciaEjecutivo;

    res.json({ ...(await vista(propiedad, actor)), volvioARevision, ...(traspaso && { traspaso }) });
});

/**
 * POST /api/propiedades/:id/estado — body: { estado }. Valida la transición
 * (§5.1) y aplica sus efectos en una transacción:
 * → Inactiva cancela visitas y solicitudes abiertas (D11);
 * Reservada → Publicada (liberar) cancela la solicitud Aprobada;
 * Arrendada → Disponible (fin de contrato) la pasa a Finalizada.
 */
router.post('/:id/estado', requiereRol(ROLES_GESTION), async (req, res) => {
    const actor = req.usuario;
    const destino = req.body?.estado;
    const propiedad = await cargarVisible(req);
    const origen = propiedad.estado;

    if (!transicionesPermitidas(propiedad, actor).includes(destino)) {
        throw errorHttp(409, `No puedes cambiar la propiedad de ${origen} a ${destino || '(sin estado)'}.`);
    }
    const exigeDuenoActivo = destino === 'Publicada' || origen === 'Inactiva';
    if (exigeDuenoActivo && !(await Usuario.exists({ id: propiedad.propietarioId, estado: 'Activo' }))) {
        throw errorHttp(409, 'El propietario no está activo: reactívalo antes de publicar o reactivar la propiedad.');
    }

    let resumen;
    await mongoose.connection.transaction(async (session) => {
        resumen = {};
        const aprobada = { propiedadId: propiedad.id, estado: 'Aprobada' };
        if (destino === 'Inactiva') {
            resumen = await cancelarPendientes({ propiedadId: propiedad.id }, session);
        }
        if (origen === 'Reservada' && destino === 'Publicada') {
            const r = await Arriendo.updateMany(aprobada, { estado: 'Cancelada' }, { session });
            resumen.arriendosCancelados = r.modifiedCount;
        }
        if (origen === 'Arrendada') {
            const r = await Arriendo.updateMany(aprobada, { estado: 'Finalizada' }, { session });
            resumen.arriendosFinalizados = r.modifiedCount;
        }
        propiedad.estado = destino;
        await propiedad.save({ session });
    });

    res.json({ ...(await vista(propiedad, actor)), resumen });
});

/** DELETE /api/propiedades/:id — borrado físico: solo admin y sin historial (§7). */
router.delete('/:id', requiereRol(ROLES_ADMIN), async (req, res) => {
    const propiedad = await cargarVisible(req);
    const historial = await Promise.all([
        Visita.exists({ propiedadId: propiedad.id }),
        Arriendo.exists({ propiedadId: propiedad.id })
    ]);
    if (historial.some(Boolean)) {
        throw errorHttp(409, 'Tiene visitas o solicitudes asociadas: usa la baja lógica (Inactiva).');
    }
    await propiedad.deleteOne();
    res.status(204).end();
});

module.exports = router;
