const express = require('express');
const router = express.Router();
const c = require('../controllers/authController');
const { requiereLogin } = require('../middleware/authMiddleware');

router.get('/login', c.formLogin);
router.post('/login', c.login);
router.get('/logout', c.logout);
router.get('/perfil', requiereLogin, c.perfil);

module.exports = router;