const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Usuario = require('../models/Usuario');
const Propiedad = require('../models/Propiedad');
const Visita = require('../models/Visita');
const Arriendo = require('../models/Arriendo');
const { cancelarPendientes, traspasarPropiedad } = require('../utils/cascadas');
const { enviarCorreo } = require('../utils/correo');
const { errorHttp } = require('../utils/errores');
const { validarIdentidad } = require('../utils/identidad');
const { repartirCartera, cargasEjecutivos } = require('../utils/reasignacion');
const { normalizarRut, rutValido } = require('../utils/rut');
const { siguienteId } = require('../utils/siguienteId');
const { ROLES } = require('../config/constantes');

/**
 * Administración de usuarios (§7, §8 de docs/modelo-logico.md):
 * listado, alta directa, edición, verificación de propietarios, bajas
 * lógicas con cascada, reactivación y borrado físico.
 * El ejecutivo administra propietarios y clientes; el admin, a todos.
 */

const ROLES_DEL_EJECUTIVO = ['propietario', 'cliente'];

/** @param {{rol: string}} actor - Usuario de la sesión. */
const rolesQueAdministra = (actor) => (actor.rol === 'admin' ? ROLES : ROLES_DEL_EJECUTIVO);

/**
 * Carga el usuario `:id` y comprueba que el actor pueda administrarlo.
 * @throws 404 si no existe, 403 si su rol no está al alcance del actor.
 */
async function cargarObjetivo(req, { conRut = false } = {}) {
    const consulta = Usuario.findOne({ id: Number(req.params.id) });
    const usuario = await (conRut ? consulta.select('+rut') : consulta);
    if (!usuario) {
        throw errorHttp(404, 'No se encontró el usuario.');
    }
    if (!rolesQueAdministra(req.usuario).includes(usuario.rol)) {
        throw errorHttp(403, 'No tienes permisos sobre este usuario.');
    }
    return usuario;
}

/** Conteo agrupado de propiedades: Map campo → cantidad. */
async function contarPropiedades(campo, filtro = {}) {
    const grupos = await Propiedad.aggregate([
        { $match: filtro },
        { $group: { _id: `$${campo}`, n: { $sum: 1 } } }
    ]);
    return new Map(grupos.map(({ _id, n }) => [_id, n]));
}

/**
 * Efectos de la baja según el rol (§7). Corren dentro de la transacción;
 * lanzar un error la revierte completa.
 */
const CASCADAS = {
    async propietario(usuario, session) {
        const propiedades = await Propiedad.find({ propietarioId: usuario.id }, 'id estado', { session });
        if (propiedades.some((p) => ['Reservada', 'Arrendada'].includes(p.estado))) {
            throw errorHttp(409, 'Tiene propiedades Reservadas o Arrendadas: resuelve esos compromisos antes de darlo de baja.');
        }
        const ids = propiedades.map((p) => p.id);
        const inactivas = await Propiedad.updateMany(
            { id: { $in: ids }, estado: { $ne: 'Inactiva' } },
            { estado: 'Inactiva' },
            { session }
        );
        return {
            propiedadesInactivas: inactivas.modifiedCount,
            ...(await cancelarPendientes({ propiedadId: { $in: ids } }, session))
        };
    },

    async cliente(usuario, session) {
        return cancelarPendientes({ clienteId: usuario.id }, session);
    },

    /** RN-16 a RN-18: reparto proporcional; visitas y solicitudes vuelven a Pendiente. */
    async ejecutivo(usuario, session) {
        const cargas = await cargasEjecutivos({ excluir: usuario.id, session });
        if (!cargas.size) {
            throw errorHttp(409, 'Es el único ejecutivo activo: crea o reactiva otro antes de darlo de baja.');
        }
        const cartera = await Propiedad.find({ ejecutivoId: usuario.id }, 'id estado', { session });
        const asignacion = repartirCartera(cartera, cargas);

        let visitasReasignadas = 0;
        let arriendosReiniciados = 0;
        for (const [propiedadId, ejecutivoId] of asignacion) {
            const traspaso = await traspasarPropiedad(propiedadId, usuario.id, ejecutivoId, session);
            visitasReasignadas += traspaso.visitas;
            arriendosReiniciados += traspaso.arriendos;
        }
        return { reasignacion: Object.fromEntries(asignacion), visitasReasignadas, arriendosReiniciados };
    },

    async admin() {
        return {};
    }
};

/** GET /api/usuarios?rol=&estado= — incluye RUT y conteo de propiedades (dueño) y cartera (ejecutivo). */
async function listarUsuarios(req, res) {
    const permitidos = rolesQueAdministra(req.usuario);
    const { rol, estado } = req.query;
    if (rol && !permitidos.includes(rol)) {
        throw errorHttp(403, 'No tienes permisos para listar ese tipo de usuario.');
    }
    const filtro = { rol: rol || { $in: permitidos }, ...(estado && { estado }) };

    const [usuarios, duenos, carteras] = await Promise.all([
        Usuario.find(filtro).select('+rut').sort('id'),
        contarPropiedades('propietarioId'),
        contarPropiedades('ejecutivoId', { estado: { $ne: 'Inactiva' } })
    ]);
    res.json(
        usuarios.map((u) => ({
            ...u.toJSON(),
            propiedades: duenos.get(u.id) || 0,
            cartera: carteras.get(u.id) || 0
        }))
    );
}

/**
 * POST /api/usuarios — alta directa: { nombre, usuario, email, rut, telefono?, rol }.
 * Nace Activo con contraseña temporal, que se devuelve una sola vez y se envía por correo.
 */
async function crearUsuario(req, res) {
    const { nombre, usuario, email, rut, telefono, rol } = req.body || {};
    if (!nombre || !usuario || !email || !rut || !rol) {
        throw errorHttp(400, 'Completa todos los campos obligatorios.');
    }
    if (!rolesQueAdministra(req.usuario).includes(rol)) {
        throw errorHttp(403, 'No puedes crear usuarios con ese rol.');
    }

    const identidad = await validarIdentidad({ usuario, email, rut });
    const passwordTemporal = crypto.randomBytes(6).toString('base64url');
    const nuevo = await Usuario.create({
        id: await siguienteId(Usuario),
        ...identidad,
        nombre,
        telefono,
        rol,
        password: await bcrypt.hash(passwordTemporal, 10),
        estado: 'Activo',
        emailVerificado: true,
        verificadoPor: rol === 'propietario' ? req.usuario.id : null,
        debeCambiarPassword: true
    });

    await enviarCorreo({
        para: nuevo.email,
        asunto: 'Tu cuenta en Gestión Urbana',
        texto:
            `Hola ${nuevo.nombre}:\n\n` +
            `Creamos tu cuenta "${nuevo.usuario}" con la contraseña temporal: ${passwordTemporal}\n` +
            `Inicia sesión en ${process.env.FRONTEND_URL}/login; te pediremos cambiarla antes de continuar.`
    });

    res.status(201).json({ usuario: nuevo.toJSON(), passwordTemporal });
}

/**
 * PATCH /api/usuarios/:id — { nombre?, email?, telefono?, rut?, rol? }.
 * Cambiar el rol es solo del admin y exige que no tenga propiedades asociadas.
 */
async function actualizarUsuario(req, res) {
    const usuario = await cargarObjetivo(req, { conRut: true });
    const { nombre, email, telefono, rut, rol } = req.body || {};

    if (rut !== undefined && !rutValido(normalizarRut(rut))) {
        throw errorHttp(400, 'El RUT ingresado no es válido.');
    }
    if (rol !== undefined && rol !== usuario.rol) {
        if (req.usuario.rol !== 'admin' || !ROLES.includes(rol)) {
            throw errorHttp(403, 'Solo un administrador puede cambiar roles.');
        }
        if (usuario.id === req.usuario.id) {
            throw errorHttp(409, 'No puedes cambiar tu propio rol.');
        }
        if (await Propiedad.exists({ $or: [{ propietarioId: usuario.id }, { ejecutivoId: usuario.id }] })) {
            throw errorHttp(409, 'Tiene propiedades asociadas: reasígnalas antes de cambiar su rol.');
        }
        usuario.rol = rol;
    }

    // undefined = campo no enviado; el índice único rechaza un email o RUT ya usado (409).
    Object.entries({ nombre, email, telefono, rut })
        .filter(([, valor]) => valor !== undefined)
        .forEach(([campo, valor]) => usuario.set(campo, valor));
    await usuario.save();

    res.json(usuario.toJSON());
}

/** POST /api/usuarios/:id/verificar — propietario Pendiente con correo confirmado → Activo (D2). */
async function verificarPropietario(req, res) {
    const usuario = await cargarObjetivo(req);
    if (usuario.rol !== 'propietario' || usuario.estado !== 'Pendiente') {
        throw errorHttp(409, 'Solo se verifican propietarios en estado Pendiente.');
    }
    if (!usuario.emailVerificado) {
        throw errorHttp(409, 'El propietario aún no confirma su correo.');
    }

    usuario.estado = 'Activo';
    usuario.verificadoPor = req.usuario.id;
    await usuario.save();
    await enviarCorreo({
        para: usuario.email,
        asunto: 'Tu cuenta de propietario fue verificada',
        texto: `Hola ${usuario.nombre}:\n\nYa puedes publicar y gestionar tus propiedades en ${process.env.FRONTEND_URL}/login.`
    });

    res.json(usuario.toJSON());
}

/** POST /api/usuarios/:id/rechazar — propietario Pendiente → Inactivo (rechazo de verificación). */
async function rechazarPropietario(req, res) {
    const usuario = await cargarObjetivo(req);
    if (usuario.rol !== 'propietario' || usuario.estado !== 'Pendiente') {
        throw errorHttp(409, 'Solo se rechazan propietarios en estado Pendiente.');
    }

    usuario.estado = 'Inactivo';
    await usuario.save();
    await enviarCorreo({
        para: usuario.email,
        asunto: 'Tu cuenta de propietario no fue aprobada',
        texto: `Hola ${usuario.nombre}:\n\nNo pudimos verificar tus datos. Contacta a la inmobiliaria si crees que es un error.`
    });

    res.json(usuario.toJSON());
}

/**
 * POST /api/usuarios/:id/baja — baja lógica con cascada según el rol (§7),
 * todo en una transacción. Responde el usuario y un resumen de los efectos.
 */
async function darDeBaja(req, res) {
    const usuario = await cargarObjetivo(req);
    if (usuario.estado === 'Inactivo') {
        throw errorHttp(409, 'La cuenta ya está desactivada.');
    }
    if (usuario.id === req.usuario.id) {
        throw errorHttp(409, 'No puedes desactivar tu propia cuenta.');
    }

    let resumen;
    await mongoose.connection.transaction(async (session) => {
        resumen = await CASCADAS[usuario.rol](usuario, session);
        usuario.estado = 'Inactivo';
        await usuario.save({ session });
    });

    res.json({ usuario: usuario.toJSON(), resumen });
}

/**
 * POST /api/usuarios/:id/reactivar — Inactivo → Activo. Sus propiedades
 * siguen Inactiva: el ejecutivo las reactiva una a una (§5.1).
 */
async function reactivarUsuario(req, res) {
    const usuario = await cargarObjetivo(req);
    if (usuario.estado !== 'Inactivo') {
        throw errorHttp(409, 'Solo se reactivan cuentas desactivadas.');
    }
    if (!usuario.emailVerificado) {
        throw errorHttp(409, 'La cuenta nunca confirmó su correo: debe registrarse de nuevo.');
    }

    usuario.estado = 'Activo';
    if (usuario.rol === 'propietario') {
        usuario.verificadoPor = req.usuario.id;
    }
    await usuario.save();

    res.json(usuario.toJSON());
}

/** DELETE /api/usuarios/:id — borrado físico, solo admin y solo sin referencias (§7). */
async function eliminarUsuario(req, res) {
    const usuario = await cargarObjetivo(req);
    if (usuario.id === req.usuario.id) {
        throw errorHttp(409, 'No puedes eliminar tu propia cuenta.');
    }

    const { id } = usuario;
    const referencias = await Promise.all([
        Propiedad.exists({ $or: [{ propietarioId: id }, { ejecutivoId: id }] }),
        Visita.exists({ $or: [{ ejecutivoId: id }, { clienteId: id }] }),
        Arriendo.exists({ $or: [{ clienteId: id }, { evaluadaPor: id }] }),
        Usuario.exists({ verificadoPor: id })
    ]);
    if (referencias.some(Boolean)) {
        throw errorHttp(409, 'Tiene propiedades, visitas, solicitudes o verificaciones asociadas: usa la baja lógica.');
    }

    await usuario.deleteOne();
    res.status(204).end();
}

module.exports = {
    listarUsuarios,
    crearUsuario,
    actualizarUsuario,
    verificarPropietario,
    rechazarPropietario,
    darDeBaja,
    reactivarUsuario,
    eliminarUsuario
};
