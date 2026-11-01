const express = require('express');
const { requiereRol } = require('../middleware/auth');
const { ROLES_INTERNOS, ROLES_ADMIN } = require('../config/constantes');
const controlador = require('../controllers/usuariosController');

/** Rutas de administración de usuarios (/api/usuarios). La lógica está en controllers/usuariosController.js. */
const router = express.Router();

router.get('/', requiereRol(ROLES_INTERNOS), controlador.listarUsuarios);
router.post('/', requiereRol(ROLES_INTERNOS), controlador.crearUsuario);
router.patch('/:id', requiereRol(ROLES_INTERNOS), controlador.actualizarUsuario);
router.post('/:id/verificar', requiereRol(ROLES_INTERNOS), controlador.verificarPropietario);
router.post('/:id/rechazar', requiereRol(ROLES_INTERNOS), controlador.rechazarPropietario);
router.post('/:id/baja', requiereRol(ROLES_INTERNOS), controlador.darDeBaja);
router.post('/:id/reactivar', requiereRol(ROLES_INTERNOS), controlador.reactivarUsuario);
router.delete('/:id', requiereRol(ROLES_ADMIN), controlador.eliminarUsuario);

module.exports = router;
