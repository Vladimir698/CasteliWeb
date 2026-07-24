'use strict';

const express = require('express');
const vehiculoController = require(
  '../controllers/vehiculoController'
);

const {
  requiereLogin,
  permitirRoles
} = require('../middleware/authMiddleware');

const router = express.Router();

router.use(requiereLogin);

router.get(
  '/nuevo/:clienteId',
  permitirRoles(
    'administrador',
    'mecanico_administrativo'
  ),
  vehiculoController.mostrarFormularioNuevo
);

router.post(
  '/cliente/:clienteId',
  permitirRoles(
    'administrador',
    'mecanico_administrativo'
  ),
  vehiculoController.crear
);

router.get(
  '/:id',
  permitirRoles(
    'administrador',
    'mecanico_administrativo'
  ),
  vehiculoController.verDetalle
);

module.exports = router;