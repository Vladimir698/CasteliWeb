const express = require('express');
const router = express.Router();
const c = require('../controllers/facturacionController');

router.get('/', c.index);
router.post('/cheques', c.crearCheque);
router.post('/facturas', c.crearFactura);
router.get('/reporte/pdf', c.reportePdf);

module.exports = router;