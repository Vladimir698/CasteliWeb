'use strict';

const db = require('../models');
const bcrypt = require('bcrypt');

const GENERIC = 'Usuario o contraseña incorrectos.';
const SESSION_8_HOURS = 1000 * 60 * 60 * 8;
const SESSION_30_DAYS = 1000 * 60 * 60 * 24 * 30;

exports.formLogin = (req, res) => {
  if (req.session?.usuario) return res.redirect('/home');
  return res.render('auth/login', { layout: false, error: null });
};

exports.login = async (req, res) => {
  try {
    const login = String(req.body.usuario || '').trim();
    const password = String(req.body.password || '');
    const mantenerSesion = req.body.mantenerSesion === 'on';

    if (!login || !password) {
      return res.status(400).render('auth/login', { layout: false, error: GENERIC });
    }

    const user = await db.Usuario.findOne({ where: { usuario: login, activo: true } });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).render('auth/login', { layout: false, error: GENERIC });
    }

    const rol = user.rolId ? await db.Rol.findByPk(user.rolId) : null;

    if (!['Administrador', 'Mecanico'].includes(rol?.nombre)) {
      return res.status(403).render('auth/login', {
        layout: false,
        error: 'Este usuario no tiene un rol habilitado para Casteli.'
      });
    }

    await new Promise((resolve, reject) =>
      req.session.regenerate(error => error ? reject(error) : resolve())
    );

    req.session.usuario = {
      id: user.id,
      nombre: user.nombre,
      usuario: user.usuario,
      rolId: user.rolId,
      rol: rol.nombre
    };

    req.session.cookie.maxAge = mantenerSesion ? SESSION_30_DAYS : SESSION_8_HOURS;

    req.session.save(error => {
      if (error) {
        console.error('Error guardando sesión:', error);
        return res.status(500).render('auth/login', {
          layout: false,
          error: 'No fue posible iniciar la sesión.'
        });
      }
      return res.redirect('/home');
    });
  } catch (error) {
    console.error('Error login:', error);
    return res.status(500).render('auth/login', {
      layout: false,
      error: 'No fue posible iniciar sesión.'
    });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('casteli.sid', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    res.redirect('/login');
  });
};

exports.perfil = (req, res) => res.render('usuarios/perfil', { title: 'Mi perfil' });
