const express = require('express');
const { requiereRol } = require('../middleware/auth');
const { ROLES, ROLES_ADMIN } = require('../config/constantes');
const controlador = require('../controllers/arriendosController');

/** Rutas de solicitudes de arriendo (/api/arriendos). La lógica está en controllers/arriendosController.js. */
const router = express.Router();

router.get('/', requiereRol(ROLES), controlador.listarArriendos);
router.post('/', requiereRol(['cliente']), controlador.solicitarArriendo);
router.post('/:id/estado', requiereRol(ROLES), controlador.cambiarEstadoArriendo);
router.delete('/:id', requiereRol(ROLES_ADMIN), controlador.eliminarArriendo);

module.exports = router;
