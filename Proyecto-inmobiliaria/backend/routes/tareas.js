const express = require('express');
const controlador = require('../controllers/tareasController');

/** Rutas de procesos periódicos (/api/tareas). La lógica está en controllers/tareasController.js. */
const router = express.Router();

router.get('/', controlador.ejecutarTareasProgramadas);

module.exports = router;
