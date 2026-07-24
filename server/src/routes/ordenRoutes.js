'use strict';

const express = require('express');
const ordenController = require('../controllers/ordenController');

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
    'mecanico_administrativo',
    'mecanico'
  ),
  ordenController.listarActivas
);

router.get(
  '/nueva/:vehiculoId',
  permitirRoles(
    'administrador',
    'mecanico_administrativo'
  ),
  ordenController.mostrarFormularioNuevo
);

router.post(
  '/vehiculo/:vehiculoId',
  permitirRoles(
    'administrador',
    'mecanico_administrativo'
  ),
  ordenController.crear
);

router.get(
  '/:id',
  permitirRoles(
    'administrador',
    'mecanico_administrativo',
    'mecanico'
  ),
  ordenController.verDetalle
);

module.exports = router;