
const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');

//endpoints tipo REST API para usuario, con operaciones CRUD
//la id de cada usuario es generada automáticamente por MongoDB y se puede usar para actualizar o borrar usuarios específicos

//mostrar
router.get('/', async (req, res) => {
  const usuarios = await Usuario.find().sort({ creadaEn: -1 });
  res.json(usuarios);
});

//crear
router.post('/', async (req, res) => {
  const nueva = new Usuario({ nombre: req.body.nombre, rut: req.body.rut, 
                            email: req.body.email, password: req.body.password, 
                            telefono: req.body.telefono, rol: req.body.rol, 
                            estado: req.body.estado});
  await nueva.save();
  res.status(201).json(nueva);
});

//actualizar
router.put('/:id', async (req, res) => {
  const actualizada = await Usuario.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(actualizada);
});

//borrar
router.delete('/:id', async (req, res) => {
  await Usuario.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

module.exports = router;