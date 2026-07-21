const express = require('express');
const router = express.Router();

const c = require('../controllers/encargadosController');
const { requiereLogin, permitirRoles, soloAdmin } = require('../middleware/authMiddleware');

router.get('/', requiereLogin, permitirRoles('Administrador', 'Profesor'), c.index);

router.get('/api/estudiante/:id', requiereLogin, permitirRoles('Administrador', 'Profesor'), c.getByEstudiante);

router.post('/nuevo', requiereLogin, soloAdmin, c.crear);

router.post('/:id/editar', requiereLogin, soloAdmin, c.actualizar);

router.post('/:id/eliminar', requiereLogin, soloAdmin, c.eliminar);

router.post('/:id/toggle', requiereLogin, soloAdmin, c.toggleEstado);

router.post('/:id/pago', requiereLogin, soloAdmin, c.registrarPago);

router.post('/pago/:id/eliminar', requiereLogin, soloAdmin, c.eliminarPago);

module.exports = router;