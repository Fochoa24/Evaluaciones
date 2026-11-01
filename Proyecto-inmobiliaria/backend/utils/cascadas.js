const Propiedad = require('../models/Propiedad');
const Visita = require('../models/Visita');
const Arriendo = require('../models/Arriendo');
const {
    ESTADOS_VISITA_ACTIVOS,
    ESTADOS_ARRIENDO_NO_FINALIZADOS,
    ESTADOS_ARRIENDO_CON_APROBACION
} = require('../config/constantes');

/**
 * Efectos sobre visitas y solicitudes de las bajas y reasignaciones (§7).
 * Reciben la `session` de la transacción que los envuelve.
 */

/**
 * Cancela las visitas activas y las solicitudes no finalizadas que cumplan `filtro`.
 * @param {object} filtro - Ej: { propiedadId: 5 } o { clienteId: 4 }.
 * @returns {Promise<{visitasCanceladas: number, arriendosCancelados: number}>}
 */
async function cancelarPendientes(filtro, session) {
    const visitas = await Visita.updateMany(
        { ...filtro, estado: { $in: ESTADOS_VISITA_ACTIVOS } },
        { estado: 'Cancelada' },
        { session }
    );
    const arriendos = await Arriendo.updateMany(
        { ...filtro, estado: { $in: ESTADOS_ARRIENDO_NO_FINALIZADOS } },
        { estado: 'Cancelada' },
        { session }
    );
    return { visitasCanceladas: visitas.modifiedCount, arriendosCancelados: arriendos.modifiedCount };
}

/**
 * Cambia el ejecutivo responsable de una propiedad (RN-17): sus visitas
 * activas pasan al nuevo con estado Pendiente y las solicitudes que
 * llevaban la aprobación del anterior vuelven a Pendiente.
 * @returns {Promise<{visitas: number, arriendos: number}>} Documentos afectados.
 */
async function traspasarPropiedad(propiedadId, desde, hacia, session) {
    await Propiedad.updateOne({ id: propiedadId }, { ejecutivoId: hacia }, { session });
    const visitas = await Visita.updateMany(
        { propiedadId, ejecutivoId: desde, estado: { $in: ESTADOS_VISITA_ACTIVOS } },
        { ejecutivoId: hacia, estado: 'Pendiente', reasignada: true },
        { session }
    );
    const arriendos = await Arriendo.updateMany(
        { propiedadId, estado: { $in: ESTADOS_ARRIENDO_CON_APROBACION } },
        { estado: 'Pendiente', evaluadaPor: null, evaluadaEn: null, venceEn: null, motivo: '' },
        { session }
    );
    return { visitas: visitas.modifiedCount, arriendos: arriendos.modifiedCount };
}

module.exports = { cancelarPendientes, traspasarPropiedad };
