
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const usuariosRouter = require('./routes/usuario');
const propiedadesRouter = require('./routes/propiedad');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']); //forzar a node a usar servidores DNS públicos, necesario para la conexion a mongodb atlas universalmente

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('../frontend'));
app.use('/api/usuarios', usuariosRouter);
app.use('/api/propiedades', propiedadesRouter);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Conectado a MongoDB');
    app.listen(process.env.PORT, () => {
      console.log(`Servidor en http://localhost:${process.env.PORT}`); //predeterminado es 3000, pero puede ser cambiado en el archivo .env
    });
  })
  .catch((err) => console.error('Error al conectar a MongoDB:', err));