const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const { motivoBloqueo } = require('../middleware/auth');
const { enviarCorreo } = require('../utils/correo');
const { errorHttp } = require('../utils/errores');
const { validarIdentidad } = require('../utils/identidad');
const { siguienteId } = require('../utils/siguienteId');
const { ROLES_REGISTRO } = require('../config/constantes');

/**
 * Login, registro y activación por correo (§2.2 de docs/modelo-logico.md).
 * Los mensajes replican los del frontend para mostrar los mismos textos.
 */

/** Vigencia del enlace de activación. */
const HORAS_TOKEN = 24;

/** El token viaja en el correo; en la base solo queda su hash. */
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

/**
 * Respuesta de sesión: token JWT (8 h) + usuario sin password ni RUT.
 * @param {object} usuario - Documento Mongoose.
 */
function respuestaSesion(usuario) {
    const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, process.env.JWT_SECRET, {
        expiresIn: '8h'
    });
    return { token, user: usuario.toJSON() };
}

/**
 * Genera un enlace de activación nuevo (invalida el anterior), guarda el
 * usuario y envía el correo.
 * @param {object} usuario - Documento Mongoose.
 */
async function enviarActivacion(usuario) {
    const token = crypto.randomBytes(32).toString('hex');
    usuario.tokenVerificacion = hashToken(token);
    usuario.tokenExpira = new Date(Date.now() + HORAS_TOKEN * 3600000);
    await usuario.save();
    await enviarCorreo({
        para: usuario.email,
        asunto: 'Activa tu cuenta en Gestión Urbana',
        texto:
            `Hola ${usuario.nombre}:\n\n` +
            `Activa tu cuenta con este enlace (vence en ${HORAS_TOKEN} horas):\n` +
            `${process.env.FRONTEND_URL}/verificar/${token}\n\n` +
            'Si no creaste esta cuenta, ignora este correo.'
    });
}

/** POST /api/auth/login — body: { usuario, password, perfil } */
async function login(req, res) {
    const { usuario, password, perfil } = req.body || {};
    if (!usuario || !password || !perfil) {
        return res.status(400).json({ mensaje: 'Completa todos los campos antes de ingresar.' });
    }

    const normalizado = String(usuario).trim().toLowerCase();
    const encontrado = await Usuario.findOne({
        $or: [{ usuario: normalizado }, { email: normalizado }]
    }).select('+password');

    if (!encontrado) {
        return res.status(401).json({
            mensaje: 'Usuario no registrado. Prueba con admin, cliente, ejecutivo o propietario.'
        });
    }

    if (!(await bcrypt.compare(String(password).trim(), encontrado.password))) {
        return res.status(401).json({ mensaje: 'La contraseña ingresada es incorrecta.' });
    }

    if (perfil !== encontrado.rol) {
        return res.status(401).json({
            mensaje: 'El perfil seleccionado no coincide con el usuario ingresado.'
        });
    }

    // Se revisa después de la contraseña: sin ella no se revela el estado de la cuenta.
    const bloqueo = motivoBloqueo(encontrado, false);
    if (bloqueo) {
        return res.status(bloqueo.status).json({ mensaje: bloqueo.mensaje, codigo: bloqueo.codigo });
    }

    res.json(respuestaSesion(encontrado));
}

/**
 * POST /api/auth/registro — body: { nombre, usuario, email, rut, password, telefono?, rol? }
 * La cuenta nace Pendiente y sin sesión: primero hay que confirmar el correo (D14).
 */
async function registro(req, res) {
    const { nombre, usuario, email, rut, password, telefono, rol = 'cliente' } = req.body || {};
    if (!nombre || !usuario || !email || !rut || !password) {
        return res.status(400).json({ mensaje: 'Completa todos los campos obligatorios.' });
    }
    if (String(password).length < 6) {
        return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 6 caracteres.' });
    }
    if (!ROLES_REGISTRO.includes(rol)) {
        return res.status(403).json({ mensaje: 'Ese tipo de usuario no se puede auto-registrar.' });
    }

    const identidad = await validarIdentidad({ usuario, email, rut });
    const nuevo = new Usuario({
        id: await siguienteId(Usuario),
        ...identidad,
        nombre,
        password: await bcrypt.hash(String(password), 10),
        telefono,
        rol
    });
    await enviarActivacion(nuevo);

    res.status(201).json({
        mensaje: `Cuenta creada. Te enviamos un enlace a ${identidad.email} para activarla.`
    });
}

/**
 * POST /api/auth/verificar — body: { token }
 * El enlace del correo abre el frontend, que llama a este POST: un escáner
 * de correo que solo visita la URL no consume el token.
 */
async function verificarCorreo(req, res) {
    const { token } = req.body || {};
    const usuario = token && await Usuario.findOne({
        tokenVerificacion: hashToken(String(token)),
        tokenExpira: { $gt: new Date() }
    });
    if (!usuario) {
        return res.status(400).json({
            mensaje: 'El enlace no es válido o ya venció. Solicita uno nuevo desde el inicio de sesión.'
        });
    }

    usuario.emailVerificado = true;
    usuario.tokenVerificacion = undefined;
    usuario.tokenExpira = null;
    // D2: el cliente queda activo; el propietario sigue Pendiente hasta que lo verifique un ejecutivo.
    if (usuario.rol === 'cliente') {
        usuario.estado = 'Activo';
    }
    await usuario.save();

    res.json({
        mensaje: usuario.rol === 'cliente'
            ? 'Cuenta activada. Ya puedes iniciar sesión.'
            : 'Correo confirmado. Un ejecutivo revisará tus datos para activar tu cuenta de propietario; mientras tanto puedes iniciar sesión.'
    });
}

/** POST /api/auth/reenviar-verificacion — body: { usuario } (usuario o correo) */
async function reenviarVerificacion(req, res) {
    const dato = String(req.body?.usuario || '').trim().toLowerCase();
    const usuario = dato && await Usuario.findOne({
        $or: [{ usuario: dato }, { email: dato }],
        emailVerificado: false
    });
    if (usuario) {
        await enviarActivacion(usuario);
    }
    // Misma respuesta exista o no la cuenta: no revela qué correos están registrados.
    res.json({ mensaje: 'Si hay una cuenta pendiente con ese dato, te enviamos un nuevo enlace de activación.' });
}

/** GET /api/auth/yo — usuario de la sesión, leído desde la base. */
function obtenerSesion(req, res) {
    res.json(req.usuario);
}

/**
 * GET /api/auth/perfil — como /yo, más el RUT propio (§3.1). Aparte de /yo
 * para que el frontend no guarde el RUT en la copia local de la sesión.
 */
async function obtenerPerfil(req, res) {
    res.json(await Usuario.findOne({ id: req.usuario.id }).select('+rut'));
}

/**
 * PATCH /api/auth/perfil — body: { nombre?, telefono? }. Datos propios editables (§8);
 * email y RUT son verificados y solo los cambia un ejecutivo o admin.
 */
async function actualizarPerfil(req, res) {
    const { nombre, telefono } = req.body || {};
    if (nombre !== undefined && !String(nombre).trim()) {
        throw errorHttp(400, 'El nombre no puede quedar vacío.');
    }
    if (nombre !== undefined) req.usuario.nombre = nombre;
    if (telefono !== undefined) req.usuario.telefono = telefono;
    await req.usuario.save();
    res.json(req.usuario);
}

/** PATCH /api/auth/password — body: { actual, nueva }. Cambia la contraseña propia. */
async function cambiarPassword(req, res) {
    const { actual, nueva } = req.body || {};
    if (!actual || !nueva) {
        throw errorHttp(400, 'Completa la contraseña actual y la nueva.');
    }
    if (String(nueva).length < 6) {
        throw errorHttp(400, 'La contraseña debe tener al menos 6 caracteres.');
    }

    const usuario = await Usuario.findOne({ id: req.usuario.id }).select('+password');
    if (!(await bcrypt.compare(String(actual), usuario.password))) {
        throw errorHttp(401, 'La contraseña actual es incorrecta.');
    }
    if (String(nueva) === String(actual)) {
        throw errorHttp(400, 'La nueva contraseña debe ser distinta de la actual.');
    }
    usuario.password = await bcrypt.hash(String(nueva), 10);
    usuario.debeCambiarPassword = false;
    await usuario.save();

    res.json({ mensaje: 'Contraseña actualizada.' });
}

module.exports = {
    login,
    registro,
    verificarCorreo,
    reenviarVerificacion,
    obtenerSesion,
    obtenerPerfil,
    actualizarPerfil,
    cambiarPassword
};
