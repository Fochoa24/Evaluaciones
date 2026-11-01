const express = require('express');
const { requiereRol } = require('../middleware/auth');
const controlador = require('../controllers/authController');

/** Rutas de sesión y cuenta propia (/api/auth). La lógica está en controllers/authController.js. */
const router = express.Router();

router.post('/login', controlador.login);
router.post('/registro', controlador.registro);
router.post('/verificar', controlador.verificarCorreo);
router.post('/reenviar-verificacion', controlador.reenviarVerificacion);
router.get('/yo', requiereRol(), controlador.obtenerSesion);
router.get('/perfil', requiereRol(), controlador.obtenerPerfil);
router.patch('/perfil', requiereRol(), controlador.actualizarPerfil);
router.patch('/password', requiereRol(), controlador.cambiarPassword);

module.exports = router;
