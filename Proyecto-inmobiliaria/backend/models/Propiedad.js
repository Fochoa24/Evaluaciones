const mongoose = require('mongoose');
const { TIPOS_PROPIEDAD, ESTADOS_PROPIEDAD } = require('../config/constantes');
const opciones = require('./opciones');

/**
 * Propiedad del catálogo. §3.2 de docs/modelo-logico.md.
 * `propietarioId` y `ejecutivoId` apuntan a `usuarios.id`; Mongo no impone
 * la referencia, la valida el servidor (RN-11).
 */
const propiedadSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    titulo: { type: String, required: true, trim: true },
    tipo: { type: String, enum: TIPOS_PROPIEDAD, required: true },
    estado: { type: String, enum: ESTADOS_PROPIEDAD, default: 'Disponible' },
    comuna: { type: String, required: true, trim: true },
    direccion: { type: String, default: '', trim: true },
    ubicacion: { type: String, default: '', trim: true },
    precioMensual: { type: Number, required: true, min: 1 },
    gastosComunes: { type: Number, default: 0, min: 0 },
    superficie: { type: Number, required: true, min: 1 },
    dormitorios: { type: Number, default: 0, min: 0 },
    banos: { type: Number, default: 0, min: 0 },
    estacionamientos: { type: Number, default: 0, min: 0 },
    caracteristicas: [String],
    imagen: { type: String, default: '' },
    propietarioId: { type: Number, required: true },
    ejecutivoId: { type: Number, required: true }
}, opciones);

propiedadSchema.index({ propietarioId: 1 });
propiedadSchema.index({ ejecutivoId: 1 });
propiedadSchema.index({ estado: 1, comuna: 1, precioMensual: 1 });

// Nombre explícito: el plural automático de Mongoose sería "propiedads".
module.exports = mongoose.model('Propiedad', propiedadSchema, 'propiedades');
