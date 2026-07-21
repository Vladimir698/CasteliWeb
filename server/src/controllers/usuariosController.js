const db = require('../models');
const bcrypt = require('bcrypt');

exports.index = async (req, res) => {
  try {
    const usuarios = await db.Usuario.findAll({
      order: [['nombre', 'ASC']],
      raw: true,
    });

    const roles = await db.Rol.findAll({
      order: [['rol', 'ASC']],
      raw: true,
    });

    const usuariosConRol = usuarios.map(u => {
      const rol = roles.find(r => Number(r.id) === Number(u.rol_id));

      return {
        ...u,
        rolNombre: rol ? rol.rol : 'Sin rol',
      };
    });

    return res.render('usuarios/usuarios', {
      title: 'Usuarios',
      usuarios: usuariosConRol,
      roles,
      usuariosJson: JSON.stringify(usuariosConRol),
      rolesJson: JSON.stringify(roles),
    });
  } catch (error) {
    console.error('Error cargando usuarios:', error);
    return res.status(500).send('Error interno');
  }
};

exports.crear = async (req, res) => {
  try {
    const { nombre, apellidos, contrasenna, rol_id } = req.body;

    const hash = await bcrypt.hash(contrasenna, 10);

    await db.Usuario.create({
      nombre,
      apellidos,
      contrasenna: hash,
      rol_id,
    });

    return res.redirect('/usuarios?msg=creado');
  } catch (error) {
    console.error('Error creando usuario:', error);
    return res.status(500).send('Error creando usuario');
  }
};

exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellidos, contrasenna, rol_id } = req.body;

    const usuario = await db.Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).send('Usuario no encontrado');
    }

    const data = {
      nombre,
      apellidos,
      rol_id,
    };

    if (contrasenna && contrasenna.trim() !== '') {
      data.contrasenna = await bcrypt.hash(contrasenna, 10);
    }

    await usuario.update(data);

    return res.redirect('/usuarios?msg=actualizado');
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    return res.status(500).send('Error actualizando usuario');
  }
};

exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await db.Usuario.findByPk(id);

    if (!usuario) {
      return res.status(404).send('Usuario no encontrado');
    }

    await usuario.destroy();

    return res.redirect('/usuarios?msg=eliminado');
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    return res.status(500).send('Error eliminando usuario');
  }
};