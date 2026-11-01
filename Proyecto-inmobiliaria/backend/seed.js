/**
 * Carga la semilla demo (data/semilla.js) en Atlas. BORRA las cuatro
 * colecciones antes de insertar y sincroniza los índices de los modelos.
 * Uso: npm run seed
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const conectarDB = require('./config/db');
const Usuario = require('./models/Usuario');
const Propiedad = require('./models/Propiedad');
const Visita = require('./models/Visita');
const Arriendo = require('./models/Arriendo');
const { usuarios, propiedades, visitas, arriendos } = require('./data/semilla');

async function main() {
    await conectarDB();

    const cargas = [
        [Usuario, await Promise.all(
            usuarios.map(async (u) => ({ ...u, password: await bcrypt.hash(u.password, 10) }))
        )],
        [Propiedad, propiedades],
        [Visita, visitas],
        [Arriendo, arriendos]
    ];

    for (const [Modelo, docs] of cargas) {
        await Modelo.deleteMany({});
        // Crea los índices del schema (TTL, únicos parciales) y borra los obsoletos.
        await Modelo.syncIndexes();
        await Modelo.insertMany(docs);
        console.log(`${Modelo.collection.name}: ${docs.length}`);
    }

    await mongoose.disconnect();
}

main().catch((error) => {
    console.error('Error en la semilla:', error.message);
    process.exit(1);
});
