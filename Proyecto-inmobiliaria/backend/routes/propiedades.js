const express = require('express');
const { requiereRol, sesionOpcional } = require('../middleware/auth');
const { ROLES_GESTION, ROLES_ADMIN } = require('../config/constantes');
const controlador = require('../controllers/propiedadesController');

/** Rutas de propiedades (/api/propiedades). La lógica está en controllers/propiedadesController.js. */
const router = express.Router();

router.get('/', sesionOpcional(), controlador.listarPropiedades);
router.get('/:id', sesionOpcional(), controlador.obtenerPropiedad);
router.get('/:id/horarios', sesionOpcional(), controlador.obtenerHorarios);
router.post('/', requiereRol(ROLES_GESTION), controlador.crearPropiedad);
router.patch('/:id', requiereRol(ROLES_GESTION), controlador.actualizarPropiedad);
router.post('/:id/estado', requiereRol(ROLES_GESTION), controlador.cambiarEstadoPropiedad);
router.delete('/:id', requiereRol(ROLES_ADMIN), controlador.eliminarPropiedad);

module.exports = router;
