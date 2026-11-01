const mongoose = require('mongoose');
const { ESTADOS_VISITA, RESULTADOS_VISITA } = require('../config/constantes');
const opciones = require('./opciones');

/**
 * Visita a una propiedad. §3.3 de docs/modelo-logico.md.
 * El schema valida solo el formato de fecha y hora; el horario laboral,
 * los feriados y los choques de agenda (RN-01 a RN-05) se validan en la ruta.
 */
const visitaSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    propiedadId: { type: Number, required: true },
    propiedadTitulo: { type: String, required: true },
    /** Copia de propiedad.ejecutivoId al crear. */
    ejecutivoId: { type: Number, required: true },
    /** Solo si la pidió un cliente con sesión (D7). */
    clienteId: { type: Number, default: null },
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    telefono: { type: String, default: '', trim: true },
    fecha: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    hora: { type: String, required: true, match: /^\d{2}:(00|30)$/ },
    comentarios: { type: String, default: '', trim: true },
    estado: { type: String, enum: ESTADOS_VISITA, default: 'Pendiente' },
    resultado: { type: String, enum: RESULTADOS_VISITA, default: '' },
    /** RN-17: volvió a Pendiente por la baja de su ejecutivo. */
    reasignada: { type: Boolean, default: false }
}, opciones);

visitaSchema.index({ ejecutivoId: 1, fecha: 1 });
visitaSchema.index({ propiedadId: 1, fecha: 1 });
visitaSchema.index({ clienteId: 1 });

module.exports = mongoose.model('Visita', visitaSchema);
