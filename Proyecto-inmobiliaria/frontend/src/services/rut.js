/**
 * Validación de RUT para dar aviso inmediato en formularios.
 * Copia de backend/utils/rut.js (el backend valida de nuevo): cambiar ambos.
 */

/**
 * Quita puntos y espacios y ubica el guion antes del DV.
 * @param {string} rut - '12.345.678-5', '123456785', '12345678-k'...
 * @returns {string} '12345678-5'
 */
function normalizarRut(rut) {
    const limpio = String(rut ?? '').replace(/[^0-9kK]/g, '').toUpperCase();
    return limpio.length < 2 ? limpio : `${limpio.slice(0, -1)}-${limpio.slice(-1)}`;
}

/**
 * @param {string} rut - En cualquier formato.
 * @returns {boolean} true si el dígito verificador (módulo 11) es correcto.
 */
export function rutValido(rut) {
    const partes = /^(\d{7,8})-([\dK])$/.exec(normalizarRut(rut));
    if (!partes) return false;
    let suma = 0;
    let factor = 2;
    for (let i = partes[1].length - 1; i >= 0; i--) {
        suma += Number(partes[1][i]) * factor;
        factor = factor === 7 ? 2 : factor + 1;
    }
    const dv = 11 - (suma % 11);
    return (dv === 11 ? '0' : dv === 10 ? 'K' : String(dv)) === partes[2];
}
