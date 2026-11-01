/**
 * Error con código HTTP. Lanzarlo dentro de una ruta async basta:
 * Express 5 lo lleva al manejador de server.js, que responde { mensaje }.
 * @param {number} status
 * @param {string} mensaje - Texto para el usuario.
 */
function errorHttp(status, mensaje) {
    return Object.assign(new Error(mensaje), { status });
}

module.exports = { errorHttp };
