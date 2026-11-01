/**
 * RUT chileno: normalización y dígito verificador (módulo 11).
 * Formato guardado: cuerpo sin puntos + guion + DV en mayúscula (12345678-5).
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
 * Calcula el DV de un cuerpo numérico.
 * @param {string} cuerpo - Dígitos sin DV.
 * @returns {string} '0'-'9' o 'K'.
 */
function calcularDv(cuerpo) {
    let suma = 0;
    let factor = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += Number(cuerpo[i]) * factor;
        factor = factor === 7 ? 2 : factor + 1;
    }
    const dv = 11 - (suma % 11);
    return dv === 11 ? '0' : dv === 10 ? 'K' : String(dv);
}

/**
 * @param {string} rut - Ya normalizado.
 * @returns {boolean} true si tiene formato válido y DV correcto.
 */
function rutValido(rut) {
    const partes = /^(\d{7,8})-([\dK])$/.exec(rut);
    return Boolean(partes) && calcularDv(partes[1]) === partes[2];
}

module.exports = { normalizarRut, calcularDv, rutValido };
