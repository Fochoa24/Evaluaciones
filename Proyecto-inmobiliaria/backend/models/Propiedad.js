const mongoose = require('mongoose');

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
    direccion: { type: String, required: true },
    superficie: { type: Number, required: true },
    dormitorios: { type: Number, default: 0 },
    banos: { type: Number, default: 0 },
    estacionamientos: { type: Number, default: 0 },
    precioMensual: { type: Number, required: true },
    gastosComunes: { type: Number, default: 0 },
    caracteristicas: [String],
    imagenes: [String],
    estado: {       
        type: String, 
        enum: ['Disponible', 'Publicada', 'Reservada', 'Arrendada', 'En mantención', 'Inactiva'], 
        default: 'Disponible' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Propiedad', propiedadSchema);