
const express = require('express');
const router = express.Router();
const Propiedad = require('../models/Propiedad');

//endpoints tipo REST API para propiedad, con operaciones CRUD
//la id de cada propiedad es generada automáticamente por MongoDB y se puede usar para actualizar o borrar propiedades específicas

//mostrar
router.get('/', async (req, res) => {
  const propiedades = await Propiedad.find().sort({ createdAt: -1 });
  res.json(propiedades);
});

//crear
router.post('/', async (req, res) => {
  const nueva = new Propiedad({ titulo: req.body.titulo, tipo: req.body.tipo, propietario: req.body.propietario, 
                                comuna: req.body.comuna, ubicacion: req.body.ubicacion, 
                                superficie: req.body.superficie, dormitorios: req.body.dormitorios, banos: req.body.banos, estacionamientos: req.body.estacionamientos,
                                precioMensual: req.body.precioMensual, gastosComunes: req.body.gastosComunes,
                                caracteristicas: req.body.caracteristicas, imagen: req.body.imagen, estado: req.body.estado });
  await nueva.save();
  res.status(201).json(nueva);
});

//actualizar
router.put('/:id', async (req, res) => {
  const actualizada = await Propiedad.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(actualizada);
});

//borrar
router.delete('/:id', async (req, res) => {
  await Propiedad.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

module.exports = router;
