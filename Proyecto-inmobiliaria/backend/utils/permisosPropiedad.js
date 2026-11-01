const { ROLES_INTERNOS } = require('../config/constantes');

/**
 * Permisos sobre una propiedad (§5.1 y §8 de docs/modelo-logico.md).
 * Funciones puras: las usan las rutas para autorizar y para decirle al
 * frontend qué acciones mostrar (`puedeEditar`, `transiciones`).
 */

/** Hay un compromiso con un cliente: el propietario no edita (solo lectura). */
const COMPROMETIDAS = ['Reservada', 'Arrendada'];

/**
 * §5.1: estado actual → { destino: quién }. 'cartera' = ejecutivo responsable
 * o admin; 'gestion' = además el propietario dueño. A Reservada solo se llega
 * con la segunda aprobación del arriendo (controllers/arriendosController.js, RN-09).
 */
const TRANSICIONES = {
    Disponible: { Publicada: 'cartera', 'En mantención': 'gestion', Inactiva: 'gestion' },
    Publicada: { Disponible: 'cartera', 'En mantención': 'gestion', Inactiva: 'gestion' },
    Reservada: { Publicada: 'cartera', Arrendada: 'cartera' },
    Arrendada: { Disponible: 'cartera' },
    'En mantención': { Disponible: 'gestion', Publicada: 'cartera', Inactiva: 'gestion' },
    Inactiva: { Disponible: 'cartera' }
};

/**
 * Nivel del usuario sobre la propiedad.
 * @returns {'cartera' | 'gestion' | null}
 */
function nivelSobre(propiedad, usuario) {
    if (!usuario || usuario.estado !== 'Activo') return null;
    if (usuario.rol === 'admin') return 'cartera';
    if (usuario.rol === 'ejecutivo' && propiedad.ejecutivoId === usuario.id) return 'cartera';
    if (usuario.rol === 'propietario' && propiedad.propietarioId === usuario.id) return 'gestion';
    return null;
}

/** Ve dirección exacta y dueño: internos y el propio dueño (D5, solo comuna al público). */
function puedeVerCompleta(propiedad, usuario) {
    return Boolean(usuario) && (ROLES_INTERNOS.includes(usuario.rol) || propiedad.propietarioId === usuario.id);
}

/** Edita datos: responsable o admin siempre; el dueño, si no está comprometida. */
function puedeEditar(propiedad, usuario) {
    const nivel = nivelSobre(propiedad, usuario);
    return nivel === 'cartera' || (nivel === 'gestion' && !COMPROMETIDAS.includes(propiedad.estado));
}

/**
 * Estados a los que este usuario puede llevar la propiedad.
 * @returns {string[]}
 */
function transicionesPermitidas(propiedad, usuario) {
    const nivel = nivelSobre(propiedad, usuario);
    if (!nivel) return [];
    return Object.entries(TRANSICIONES[propiedad.estado] || {})
        .filter(([, quien]) => nivel === 'cartera' || quien === 'gestion')
        .map(([destino]) => destino);
}

module.exports = { COMPROMETIDAS, nivelSobre, puedeVerCompleta, puedeEditar, transicionesPermitidas };
