const mongoose = require('mongoose');
const { ROLES, ESTADOS_CUENTA, DIAS_CUENTA_SIN_ACTIVAR } = require('../config/constantes');
const { normalizarRut, rutValido } = require('../utils/rut');
const opciones = require('./opciones');

/**
 * Usuario de login, incluidos los propietarios (D1). §3.1 de docs/modelo-logico.md.
 * Campos privados con `select: false`: password (hash bcrypt), rut y token de
 * activación; solo se leen con `.select('+campo')`. El largo mínimo de la
 * contraseña (6) se valida en la ruta, antes de hashear.
 */
const usuarioSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    usuario: { type: String, required: true, unique: true, trim: true, lowercase: true },
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    rut: {
        type: String,
        required: true,
        unique: true,
        select: false,
        set: normalizarRut,
        validate: { validator: rutValido, message: 'RUT inválido.' }
    },
    password: { type: String, required: true, select: false },
    telefono: { type: String, default: '', trim: true },
    rol: { type: String, enum: ROLES, default: 'cliente' },
    estado: { type: String, enum: ESTADOS_CUENTA, default: 'Pendiente' },
    emailVerificado: { type: Boolean, default: false },
    tokenVerificacion: { type: String, select: false },
    tokenExpira: { type: Date, default: null },
    /** Solo propietarios: ejecutivo o admin que lo activó (D2). */
    verificadoPor: { type: Number, default: null },
    /** Alta interna con contraseña temporal: debe cambiarla antes de operar (§11). */
    debeCambiarPassword: { type: Boolean, default: false }
}, opciones);

usuarioSchema.index({ rol: 1, estado: 1 });
// D16/RN-20: Mongo borra las cuentas sin correo confirmado a los 14 días.
usuarioSchema.index(
    { createdAt: 1 },
    {
        expireAfterSeconds: DIAS_CUENTA_SIN_ACTIVAR * 86400,
        partialFilterExpression: { emailVerificado: false }
    }
);

module.exports = mongoose.model('Usuario', usuarioSchema);
