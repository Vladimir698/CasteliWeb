  'use strict';

  const express = require('express');
  const clienteController = require('../controllers/clienteController');

  const {
    requiereLogin,
    permitirRoles
  } = require('../middleware/authMiddleware');

  const router = express.Router();

  router.use(requiereLogin);

  router.get(
    '/',
    permitirRoles(
      'administrador',
      'mecanico_administrativo'
    ),
    clienteController.listar
  );

  router.get(
    '/nuevo',
    permitirRoles(
      'administrador',
      'mecanico_administrativo'
    ),
    clienteController.mostrarFormularioNuevo
  );

  router.post(
    '/',
    permitirRoles(
      'administrador',
      'mecanico_administrativo'
    ),
    clienteController.crear
  );

  router.get(
    '/:id',
    permitirRoles(
      'administrador',
      'mecanico_administrativo'
    ),
    clienteController.verDetalle
  );

  module.exports = router;