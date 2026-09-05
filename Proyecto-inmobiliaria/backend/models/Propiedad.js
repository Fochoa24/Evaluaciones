const mongoose = require('mongoose');

//modelo propiedad, actualizada para concordar con datos.js y con el frontend, incluyendo la referencia al propietario (usuario) y el estado de la propiedad

const propiedadSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    tipo: { 
        type: String, 
        enum: ['Departamento', 'Casa', 'Oficina', 'Local comercial'], 
        required: true 
    },
    propietario: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Usuario', 
        required: true 
    },
    comuna: { type: String, required: true },
    ubicacion: { type: String, required: true },
    superficie: { type: Number, required: true },
    dormitorios: { type: Number, default: 0 },
    banos: { type: Number, default: 0 },
    estacionamientos: { type: Number, default: 0 },
    precioMensual: { type: Number, required: true },
    gastosComunes: { type: Number, default: 0 },
    caracteristicas: [String],
    imagen: { type: String },
    estado: {       
        type: String, 
        enum: ['Disponible', 'Publicada', 'Reservada', 'Arrendada', 'En mantención', 'Inactiva'], 
        default: 'Disponible' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Propiedad', propiedadSchema);
