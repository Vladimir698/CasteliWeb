const express = require('express');
const router = express.Router();
const c = require('../controllers/usuariosController');
const { requiereLogin, soloAdmin } = require('../middleware/authMiddleware');

router.get('/', requiereLogin, soloAdmin, c.index);
router.post('/nuevo', requiereLogin, soloAdmin, c.crear);
router.post('/:id/editar', requiereLogin, soloAdmin, c.actualizar);
router.post('/:id/eliminar', requiereLogin, soloAdmin, c.eliminar);

module.exports = router;