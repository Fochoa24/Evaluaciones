const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

/**
 * Motivo por el que una cuenta no puede operar (§2.2), o null si puede.
 * Lo usan el login y este middleware, para que ambos respondan igual.
 * @param {{estado: string, emailVerificado: boolean}} usuario
 * @param {boolean} gestion - true si la acción exige cuenta Activo. Un
 *   propietario con correo confirmado pero sin verificar puede iniciar
 *   sesión y ver su aviso, pero no gestionar.
 * @returns {{status: number, codigo: string, mensaje: string} | null}
 */
function motivoBloqueo(usuario, gestion) {
    if (usuario.estado === 'Inactivo') {
        return { status: 403, codigo: 'CUENTA_INACTIVA', mensaje: 'Tu cuenta está desactivada. Contacta a la inmobiliaria.' };
    }
    if (!usuario.emailVerificado) {
        return { status: 403, codigo: 'EMAIL_NO_VERIFICADO', mensaje: 'Activa tu cuenta con el enlace que enviamos a tu correo.' };
    }
    if (gestion && usuario.estado !== 'Activo') {
        return {
            status: 403,
            codigo: 'CUENTA_EN_VERIFICACION',
            mensaje: 'Tu cuenta está en verificación. Un ejecutivo debe aprobarla antes de que puedas gestionar.'
        };
    }
    return null;
}

/**
 * Exige un JWT válido (`Authorization: Bearer <token>`), carga el usuario
 * desde la base (B11: una baja o un cambio de rol rige de inmediato, sin
 * esperar a que venza el token) y, si se indican roles, exige cuenta Activo
 * y un rol de la lista. Deja el documento en `req.usuario`.
 * @param {string[]} [roles] - Roles permitidos; vacío = cualquier sesión.
 */
function requiereRol(roles = []) {
    return async (req, res, next) => {
        const [tipo, token] = (req.headers.authorization || '').split(' ');
        if (tipo !== 'Bearer' || !token) {
            return res.status(401).json({ mensaje: 'Debes iniciar sesión.' });
        }

        let payload;
        try {
            payload = jwt.verify(token, process.env.JWT_SECRET);
        } catch {
            return res.status(401).json({ mensaje: 'Sesión expirada. Inicia sesión nuevamente.' });
        }

        const usuario = await Usuario.findOne({ id: payload.id });
        if (!usuario) {
            return res.status(401).json({ mensaje: 'Debes iniciar sesión.' });
        }

        const bloqueo = motivoBloqueo(usuario, roles.length > 0);
        if (bloqueo) {
            return res.status(bloqueo.status).json({ mensaje: bloqueo.mensaje, codigo: bloqueo.codigo });
        }
        if (roles.length && !roles.includes(usuario.rol)) {
            return res.status(403).json({ mensaje: 'No tienes permisos para esta acción.' });
        }
        // Contraseña temporal (§11): solo las rutas de la propia cuenta (/api/auth) hasta cambiarla.
        if (usuario.debeCambiarPassword && req.baseUrl !== '/api/auth') {
            return res.status(403).json({
                mensaje: 'Debes cambiar tu contraseña temporal antes de continuar.',
                codigo: 'PASSWORD_TEMPORAL'
            });
        }

        req.usuario = usuario;
        next();
    };
}

/**
 * Para rutas públicas que muestran más a quien tiene sesión (catálogo): si
 * llega un token válido de una cuenta habilitada deja `req.usuario`; si no,
 * sigue como visitante, sin error.
 */
function sesionOpcional() {
    return async (req, _res, next) => {
        const [tipo, token] = (req.headers.authorization || '').split(' ');
        if (tipo === 'Bearer' && token) {
            try {
                const { id } = jwt.verify(token, process.env.JWT_SECRET);
                const usuario = await Usuario.findOne({ id });
                // Con contraseña temporal se atiende como visitante hasta cambiarla.
                if (usuario && !motivoBloqueo(usuario, false) && !usuario.debeCambiarPassword) {
                    req.usuario = usuario;
                }
            } catch {
                // Token vencido o inválido: se atiende como visitante.
            }
        }
        next();
    };
}

module.exports = { requiereRol, sesionOpcional, motivoBloqueo };
