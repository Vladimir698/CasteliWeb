const express = require('express');
const router = express.Router();
const c = require('../controllers/empleadosController');

router.get('/', c.index);
router.post('/nuevo', c.crear);
router.post('/:id/editar', c.actualizar);
router.post('/:id/eliminar', c.eliminar);

module.exports = router;