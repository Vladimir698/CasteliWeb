exports.requiereLogin = (req, res, next) => {

  // Solo durante el desarrollo
  if (process.env.DEV_MODE === 'true') {

    req.session.usuario = {
      id: 1,
      nombre: 'Administrador',
      usuario: 'admin',
      rol: 'Administrador'
    };

    return next();
  }

  if (!req.session.usuario) {
    return res.redirect('/login');
  }

  next();
};

exports.soloAdmin = (req, res, next) => {
  if (!req.session.usuario || req.session.usuario.rol !== 'Administrador') {
    return res
      .status(403)
      .send('No tiene permisos para acceder a esta sección.');
  }

  next();
};

exports.permitirRoles = (...rolesPermitidos) => {
  return (req, res, next) => {

    if (!req.session.usuario) {
      return res.redirect('/login');
    }

    if (!rolesPermitidos.includes(req.session.usuario.rol)) {
      return res
        .status(403)
        .send('No tiene permisos para acceder a esta sección.');
    }

    next();
  };
};