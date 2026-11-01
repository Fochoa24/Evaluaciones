/**
 * Reparto proporcional de una cartera (RN-16): cada propiedad, en orden de
 * id, va al ejecutivo con menor carga en ese momento (empate: menor id).
 * Las propiedades Inactiva también cambian de responsable (ejecutivoId es
 * obligatorio), pero no suman carga.
 * @param {{id: number, estado: string}[]} propiedades - Cartera del ejecutivo que sale.
 * @param {Map<number, number>} cargas - ejecutivoId activo → propiedades no Inactiva.
 * @returns {Map<number, number>} propiedadId → nuevo ejecutivoId.
 */
function repartirCartera(propiedades, cargas) {
    if (!cargas.size) {
        throw new Error('No hay ejecutivos activos para recibir la cartera.');
    }
    const carga = new Map(cargas);
    const asignacion = new Map();
    for (const { id, estado } of [...propiedades].sort((a, b) => a.id - b.id)) {
        const [destino] = [...carga].sort(([idA, a], [idB, b]) => a - b || idA - idB)[0];
        asignacion.set(id, destino);
        if (estado !== 'Inactiva') {
            carga.set(destino, carga.get(destino) + 1);
        }
    }
    return asignacion;
}

/**
 * Carga de cada ejecutivo Activo: propiedades no Inactiva a su cargo.
 * @param {{excluir?: number, session?: object}} [opciones] - excluir: id del ejecutivo saliente.
 * @returns {Promise<Map<number, number>>} ejecutivoId → carga (0 si no tiene).
 */
async function cargasEjecutivos({ excluir = null, session = null } = {}) {
    // require diferido: repartirCartera se prueba sin cargar modelos.
    const Usuario = require('../models/Usuario');
    const Propiedad = require('../models/Propiedad');
    const ejecutivos = await Usuario.find(
        { rol: 'ejecutivo', estado: 'Activo', id: { $ne: excluir } },
        'id',
        { session }
    );
    const ids = ejecutivos.map((e) => e.id);
    const grupos = await Propiedad.aggregate([
        { $match: { ejecutivoId: { $in: ids }, estado: { $ne: 'Inactiva' } } },
        { $group: { _id: '$ejecutivoId', n: { $sum: 1 } } }
    ]).session(session);
    const ocupadas = new Map(grupos.map(({ _id, n }) => [_id, n]));
    return new Map(ids.map((id) => [id, ocupadas.get(id) || 0]));
}

/**
 * Ejecutivo activo con menor carga (RN-12), con el mismo criterio del reparto.
 * @returns {Promise<number>} ejecutivoId.
 * @throws Si no hay ejecutivos activos.
 */
async function ejecutivoConMenorCarga(session = null) {
    const cargas = await cargasEjecutivos({ session });
    if (!cargas.size) {
        const { errorHttp } = require('./errores');
        throw errorHttp(409, 'No hay ejecutivos activos para asignar la propiedad.');
    }
    return repartirCartera([{ id: 0, estado: 'Disponible' }], cargas).get(0);
}

module.exports = { repartirCartera, cargasEjecutivos, ejecutivoConMenorCarga };
