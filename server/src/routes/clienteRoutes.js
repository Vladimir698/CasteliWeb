'use strict';

const express = require('express');
const clienteController = require('../controllers/clienteController');
const { requiereLogin, soloAdmin } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(requiereLogin);

router.get('/', soloAdmin, clienteController.listar);
router.get('/nuevo', soloAdmin, clienteController.mostrarFormularioNuevo);
router.post('/', soloAdmin, clienteController.crear);
router.get('/:id', soloAdmin, clienteController.verDetalle);

module.exports = router;
