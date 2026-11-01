/**
 * Permisos sobre una solicitud de arriendo (§5.3 y §8 de docs/modelo-logico.md).
 * Función pura: la usa la ruta para autorizar y para decirle al frontend qué
 * botones mostrar (`transiciones`).
 */

/**
 * Estado actual → { destino: quién }. 'cartera' = ejecutivo responsable de
 * la propiedad o admin; 'duenio' = propietario de la propiedad; 'cliente' =
 * el cliente que la pidió.
 */
const TRANSICIONES = {
    Pendiente: {
        'En evaluación': ['cartera'],
        'Esperando propietario': ['cartera'],
        Rechazada: ['cartera'],
        Cancelada: ['cartera', 'cliente']
    },
    'En evaluación': {
        'Esperando propietario': ['cartera'],
        Rechazada: ['cartera'],
        Cancelada: ['cartera', 'cliente']
    },
    'Esperando propietario': {
        Aprobada: ['duenio'],
        Rechazada: ['duenio'],
        Cancelada: ['cartera', 'cliente']
    },
    // Reactivar: vuelve a Pendiente sin la primera aprobación (§11).
    Vencida: { Pendiente: ['cliente'], Cancelada: ['cartera', 'cliente'] },
    // Liberar la reserva; el cliente no desiste en línea (fase 6).
    Aprobada: { Cancelada: ['cartera'] }
};

/** Papeles que `usuario` cumple sobre la solicitud. */
function papeles(arriendo, propiedad, usuario) {
    if (!usuario || usuario.estado !== 'Activo') return [];
    const lista = [];
    if (usuario.rol === 'admin' || (usuario.rol === 'ejecutivo' && propiedad?.ejecutivoId === usuario.id)) lista.push('cartera');
    if (usuario.rol === 'propietario' && propiedad?.propietarioId === usuario.id) lista.push('duenio');
    if (usuario.rol === 'cliente' && arriendo.clienteId === usuario.id) lista.push('cliente');
    return lista;
}

/**
 * Estados a los que `usuario` puede llevar la solicitud.
 * @returns {string[]}
 */
function transicionesArriendo(arriendo, propiedad, usuario) {
    const suyos = papeles(arriendo, propiedad, usuario);
    return Object.entries(TRANSICIONES[arriendo.estado] || {})
        .filter(([, quienes]) => quienes.some((q) => suyos.includes(q)))
        .map(([destino]) => destino);
}

module.exports = { transicionesArriendo };
