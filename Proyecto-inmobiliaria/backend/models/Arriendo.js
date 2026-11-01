const mongoose = require('mongoose');
const { ESTADOS_ARRIENDO, MOTIVOS_ARRIENDO } = require('../config/constantes');
const opciones = require('./opciones');

/**
 * Solicitud de arriendo con doble aprobación (D8). §3.4 de docs/modelo-logico.md.
 * ingresoMensual, garantia, antecedentes y observacionesEjecutivo son privados:
 * la ruta no los proyecta para el propietario.
 */
const arriendoSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    propiedadId: { type: Number, required: true },
    propiedadTitulo: { type: String, required: true },
    clienteId: { type: Number, required: true },
    clienteNombre: { type: String, required: true, trim: true },
    clienteEmail: { type: String, required: true, trim: true, lowercase: true },
    clienteTelefono: { type: String, default: '', trim: true },
    ingresoMensual: { type: Number, required: true, min: 1 },
    garantia: { type: String, default: '', trim: true },
    antecedentes: { type: String, default: '', trim: true },
    estado: { type: String, enum: ESTADOS_ARRIENDO, default: 'Pendiente' },
    observacionesEjecutivo: { type: String, default: '', trim: true },
    /** Recomendación del ejecutivo; es lo que ve el propietario. */
    motivo: { type: String, enum: MOTIVOS_ARRIENDO, default: '' },
    evaluadaPor: { type: Number, default: null },
    evaluadaEn: { type: Date, default: null },
    /** RN-19: se fija al pasar a 'Esperando propietario'. */
    venceEn: { type: Date, default: null },
    respuestaPropietarioEn: { type: Date, default: null },
    motivoPropietario: { type: String, default: '', trim: true }
}, opciones);

arriendoSchema.index({ clienteId: 1 });
// Compuesto para no repetir la clave del índice único parcial de abajo.
arriendoSchema.index({ propiedadId: 1, estado: 1 });
arriendoSchema.index({ estado: 1, venceEn: 1 });
// RN-08: como máximo una solicitud Aprobada por propiedad.
arriendoSchema.index(
    { propiedadId: 1 },
    { unique: true, partialFilterExpression: { estado: 'Aprobada' }, name: 'una_aprobada_por_propiedad' }
);

module.exports = mongoose.model('Arriendo', arriendoSchema);
