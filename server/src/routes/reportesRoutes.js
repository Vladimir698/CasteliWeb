const express = require('express');
const router = express.Router();

const c = require('../controllers/reportesController');

router.get('/', c.index);

router.get('/excel', c.exportarExcel);

router.get('/pdf', c.exportarPdf);

module.exports = router;