const db = require('../models');

exports.index = async (req, res) => {
  try {
    const proveedores = await db.Proveedor.findAll({
      order: [['nombre', 'ASC']],
    });

    return res.render('proveedores/proveedores', {
      title: 'Proveedores',
      proveedores,
    });

  } catch (error) {
    console.error('Error cargando proveedores:', error);
    return res.status(500).send('Error interno');
  }
};

exports.crear = async (req, res) => {
  try {
    const {
      nombre,
      cedula_juridica,
      telefono,
      correo,
      entidad_bancaria,
      cuenta_bancaria,
      direccion
    } = req.body;

    await db.Proveedor.create({
      nombre,
      cedula_juridica,
      telefono,
      correo,
      entidad_bancaria,
      cuenta_bancaria,
      direccion,
    });

    return res.redirect('/proveedores?msg=creado');

  } catch (error) {
    console.error('Error creando proveedor:', error);
    return res.status(500).send('Error creando proveedor');
  }
};

exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      nombre,
      cedula_juridica,
      telefono,
      correo,
      entidad_bancaria,
      cuenta_bancaria,
      direccion
    } = req.body;

    const proveedor = await db.Proveedor.findByPk(id);

    if (!proveedor) {
      return res.status(404).send('Proveedor no encontrado');
    }

    await proveedor.update({
      nombre,
      cedula_juridica,
      telefono,
      correo,
      entidad_bancaria,
      cuenta_bancaria,
      direccion,
    });

    return res.redirect('/proveedores?msg=actualizado');

  } catch (error) {
    console.error('Error actualizando proveedor:', error);
    return res.status(500).send('Error actualizando proveedor');
  }
};

exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;

    const proveedor = await db.Proveedor.findByPk(id);

    if (!proveedor) {
      return res.status(404).send('Proveedor no encontrado');
    }

    await proveedor.destroy();

    return res.redirect('/proveedores?msg=eliminado');

  } catch (error) {
    console.error('Error eliminando proveedor:', error);
    return res.status(500).send('Error eliminando proveedor');
  }
};