import { leer } from './storage';

/**
 * URL del backend. En Vercel se define la variable VITE_API_URL;
 * en local se usa el puerto por defecto del backend.
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Llama a la API con JSON y el token de sesión (`gi_token`).
 * @param {string} ruta - Ej: '/api/auth/login'.
 * @param {{method?: string, body?: object}} [opciones]
 * @returns {Promise<*>} Respuesta parseada (null si es 204).
 * @throws {Error} Con el `mensaje` del backend, `status` y `codigo`.
 */
export async function api(ruta, { method = 'GET', body } = {}) {
    const token = leer('token');
    let respuesta;
    try {
        respuesta = await fetch(API_URL + ruta, {
            method,
            headers: {
                ...(body && { 'Content-Type': 'application/json' }),
                ...(token && { Authorization: `Bearer ${token}` })
            },
            body: body && JSON.stringify(body)
        });
    } catch {
        throw Object.assign(new Error('No se pudo conectar con el servidor. Intenta nuevamente.'), {
            status: 0
        });
    }

    const datos = respuesta.status === 204 ? null : await respuesta.json().catch(() => null);
    if (!respuesta.ok) {
        throw Object.assign(new Error(datos?.mensaje || 'Ocurrió un error inesperado.'), {
            status: respuesta.status,
            codigo: datos?.codigo
        });
    }
    return datos;
}

/**
 * Convierte una llamada a la API en el formato que esperan las páginas,
 * sin lanzar: { ok, mensaje, codigo?, datos? }.
 * @param {Promise<*>} promesa - Ej: api('/api/...').
 */
export async function resultado(promesa) {
    try {
        const datos = await promesa;
        return { ok: true, mensaje: datos?.mensaje || '', datos };
    } catch (error) {
        return { ok: false, mensaje: error.message, codigo: error.codigo };
    }
}
