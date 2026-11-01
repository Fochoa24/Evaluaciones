const Usuario = require('../models/Usuario');
const { errorHttp } = require('./errores');
const { normalizarRut, rutValido } = require('./rut');

/**
 * Normaliza usuario, email y RUT de una cuenta nueva, valida el RUT y
 * revisa que ninguno esté tomado. Lo usan el registro y el alta interna.
 * @param {{usuario: string, email: string, rut: string}} datos
 * @returns {Promise<{usuario: string, email: string, rut: string}>} Normalizados.
 * @throws 400 si el RUT es inválido, 409 si alguno ya está registrado.
 */
async function validarIdentidad({ usuario, email, rut }) {
    const normalizados = {
        usuario: String(usuario).trim().toLowerCase(),
        email: String(email).trim().toLowerCase(),
        rut: normalizarRut(rut)
    };
    if (!rutValido(normalizados.rut)) {
        throw errorHttp(400, 'El RUT ingresado no es válido.');
    }
    const tomado = await Usuario.exists({
        $or: [{ usuario: normalizados.usuario }, { email: normalizados.email }, { rut: normalizados.rut }]
    });
    if (tomado) {
        throw errorHttp(409, 'Ese usuario, correo o RUT ya está registrado.');
    }
    return normalizados;
}

module.exports = { validarIdentidad };
