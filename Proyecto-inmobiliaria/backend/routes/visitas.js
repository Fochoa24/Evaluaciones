const express = require('express');
const { requiereRol, sesionOpcional } = require('../middleware/auth');
const { ROLES, ROLES_INTERNOS, ROLES_ADMIN } = require('../config/constantes');
const controlador = require('../controllers/visitasController');

/** Rutas de visitas (/api/visitas). La lógica está en controllers/visitasController.js. */
const router = express.Router();

router.get('/', requiereRol(ROLES), controlador.listarVisitas);
router.post('/', sesionOpcional(), controlador.agendarVisita);
router.post('/:id/estado', requiereRol(ROLES), controlador.cambiarEstadoVisita);
router.patch('/:id', requiereRol(ROLES_INTERNOS), controlador.actualizarVisita);
router.delete('/:id', requiereRol(ROLES_ADMIN), controlador.eliminarVisita);

module.exports = router;
