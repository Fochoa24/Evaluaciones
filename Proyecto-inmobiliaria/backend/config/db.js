const mongoose = require('mongoose');

/**
 * Conecta Mongoose a MongoDB Atlas usando MONGODB_URI.
 * Termina el proceso si la URI falta o la conexión falla.
 */
async function conectarDB() {
    if (!process.env.MONGODB_URI) {
        console.error('Falta MONGODB_URI en .env');
        process.exit(1);
    }
    try {
        // dbName explícito: el URI de Atlas puede venir sin base y Mongo usaría `test`.
        // MONGODB_DB permite apuntar a una base de pruebas sin tocar los datos reales.
        const dbName = process.env.MONGODB_DB || 'gestion_inmobiliaria';
        await mongoose.connect(process.env.MONGODB_URI, { dbName });
        console.log(`MongoDB conectado (${dbName})`);
    } catch (error) {
        console.error('Error al conectar MongoDB:', error.message);
        process.exit(1);
    }
}

module.exports = conectarDB;
