const express = require('express');
const router = express.Router();
const c = require('../controllers/authController');
const { requiereLogin } = require('../middleware/authMiddleware');

const attempts = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function limitarLogin(req, res, next) {
  const now = Date.now();
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  const current = attempts.get(key);

  if (!current || now > current.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }

  if (current.count >= MAX_ATTEMPTS) {
    return res.status(429).render('auth/login', {
      layout: false,
      error: 'Demasiados intentos. Espere unos minutos antes de volver a intentar.'
    });
  }

  current.count += 1;
  return next();
}

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of attempts.entries()) {
    if (now > value.resetAt) attempts.delete(key);
  }
}, WINDOW_MS).unref();

router.get('/login', c.formLogin);
router.post('/login', limitarLogin, c.login);
router.get('/logout', c.logout);
router.get('/perfil', requiereLogin, c.perfil);

module.exports = router;
