const express = require('express');
const router = express.Router();
const c = require('../controllers/estudiantesController');

// APIs primero
router.get('/api/cantones', c.getCantones);
router.get('/api/distritos', c.getDistritos);

// Vistas principales
router.get('/', c.index);
router.get('/dashboard', c.dashboardEstudiantes);

// Crear
router.get('/nuevo', c.formCrear);
router.post('/nuevo', c.crear);

// Modal
router.get('/:id/modal', c.verModal);

// Editar
router.get('/:id/editar', c.formEditar);
router.post('/:id/editar', c.actualizar);

// Eliminar
router.post('/:id/eliminar', c.eliminar);

// Actualizar horario
router.post('/:id/horario', c.actualizarHorario);

module.exports = router;