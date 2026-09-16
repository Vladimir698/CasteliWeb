'use strict';
const db = require('../models');
const bcrypt = require('bcrypt');

exports.formLogin = (req, res) => res.render('auth/login', { layout: false, error: null });

exports.login = async (req, res) => {
  try {
    const login = String(req.body.usuario || '').trim();
    const password = String(req.body.password || '');
    const user = await db.Usuario.findOne({ where: { usuario: login, activo: true } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.render('auth/login', { layout: false, error: 'Usuario o contraseña incorrectos.' });
    }
    const rol = user.rolId ? await db.Rol.findByPk(user.rolId) : null;
    req.session.usuario = { id: user.id, nombre: user.nombre, usuario: user.usuario, rolId: user.rolId, rol: rol?.nombre || 'Sin rol' };
    return res.redirect('/home');
  } catch (error) {
    console.error('Error login:', error);
    return res.render('auth/login', { layout: false, error: 'Error interno al iniciar sesión.' });
  }
};
exports.logout = (req,res) => req.session.destroy(() => res.redirect('/login'));
exports.perfil = (req,res) => res.render('usuarios/perfil', { title: 'Mi perfil' });
