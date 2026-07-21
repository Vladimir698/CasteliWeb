const db = require('../models');
const bcrypt = require('bcrypt');

exports.formLogin = (req, res) => {
  return res.render('auth/login', {
    layout: false,
    error: null,
  });
};

exports.login = async (req, res) => {
  try {
    const { usuario, password } = req.body;

    const user = await db.Usuario.findOne({
      where: { nombre: usuario },
    });

    if (!user) {
      return res.render('auth/login', {
        layout: false,
        error: 'Usuario o contraseña incorrectos.',
      });
    }

    const passwordOk = await bcrypt.compare(password, user.contrasenna);

    if (!passwordOk) {
      return res.render('auth/login', {
        layout: false,
        error: 'Usuario o contraseña incorrectos.',
      });
    }

    const rol = await db.Rol.findByPk(user.rol_id);

    req.session.usuario = {
      id: user.id,
      nombre: user.nombre,
      apellidos: user.apellidos,
      rol_id: user.rol_id,
      rol: rol ? rol.rol : 'Sin rol',
    };

    return res.redirect('/home');
  } catch (error) {
    console.error('Error login:', error);

    return res.render('auth/login', {
      layout: false,
      error: 'Error interno al iniciar sesión.',
    });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};

exports.perfil = (req, res) => {
  return res.render('usuarios/perfil', {
    title: 'Mi perfil',
  });
};