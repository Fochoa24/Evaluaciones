/**
 * Cookies de preferencias con prefijo `gu_` (consentimiento de cookies).
 * Se usan cookies en lugar de localStorage porque el banner de cookies
 * debe sobrevivir a un borrado selectivo de datos de sitio.
 */

const PREFIJO_COOKIE = 'gu_';

/**
 * Obtiene el valor de una cookie de preferencias.
 * @param {string} nombre - Nombre sin prefijo (ej: 'consentimiento').
 * @returns {string|null} Valor decodificado o null.
 */
export function obtenerCookie(nombre) {
    if (typeof document === 'undefined') {
        return null;
    }

    const prefijo = `${PREFIJO_COOKIE}${nombre}=`;
    const parte = document.cookie
        .split('; ')
        .find((item) => item.startsWith(prefijo));

    if (!parte) {
        return null;
    }

    return decodeURIComponent(parte.slice(prefijo.length));
}

/**
 * Define una cookie de preferencias (sameSite=Lax, path=/).
 * @param {string} nombre - Nombre sin prefijo.
 * @param {string} valor - Valor a codificar.
 * @param {number} [dias=180] - Vigencia en días.
 */
export function definirCookie(nombre, valor, dias = 180) {
    if (typeof document === 'undefined') {
        return;
    }

    const expira = new Date(Date.now() + dias * 86400000).toUTCString();
    document.cookie = `${PREFIJO_COOKIE}${nombre}=${encodeURIComponent(valor)}; expires=${expira}; path=/; sameSite=Lax`;
}

/**
 * Elimina una cookie de preferencias (expiración en el pasado).
 * @param {string} nombre - Nombre sin prefijo.
 */
export function borrarCookie(nombre) {
    if (typeof document === 'undefined') {
        return;
    }

    document.cookie = `${PREFIJO_COOKIE}${nombre}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}
