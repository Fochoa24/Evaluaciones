/**
 * Persistencia local de la demo con prefijo `gi_` (evita colisiones
 * con otras apps en el mismo origen). Si localStorage no está
 * disponible, las operaciones fallan en silencio.
 */

const PREFIJO = 'gi_';

/**
 * Lee y parsea un valor JSON de localStorage.
 * @param {string} clave - Clave sin prefijo (ej: 'sesion').
 * @param {*} respaldo - Valor si no hay datos o el JSON es inválido.
 * @returns {*} Datos parseados o el respaldo.
 */
export function leer(clave, respaldo = null) {
    try {
        const crudo = localStorage.getItem(PREFIJO + clave);
        return crudo === null ? respaldo : JSON.parse(crudo);
    } catch {
        return respaldo;
    }
}

/**
 * Serializa y guarda un valor en localStorage.
 * @param {string} clave - Clave sin prefijo.
 * @param {*} valor - Cualquier valor serializable con JSON.
 */
export function guardar(clave, valor) {
    try {
        localStorage.setItem(PREFIJO + clave, JSON.stringify(valor));
    } catch {
        // almacenamiento no disponible
    }
}

/**
 * Elimina una clave del almacenamiento local.
 * @param {string} clave - Clave sin prefijo.
 */
export function eliminar(clave) {
    try {
        localStorage.removeItem(PREFIJO + clave);
    } catch {
        // almacenamiento no disponible
    }
}
