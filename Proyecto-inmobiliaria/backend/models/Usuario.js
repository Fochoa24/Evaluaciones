const mongoose = require('mongoose');

//modelo usuario

const usuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    rut: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    telefono: { type: String },
    rol: { 
        type: String, 
        enum: ['admin', 'ejecutivo', 'propietario', 'cliente'], 
        default: 'cliente' 
    },
    estado: { type: String, enum: ['activo', 'inactivo'], default: 'activo' }
}, { timestamps: true });

module.exports = mongoose.model('Usuario', usuarioSchema);