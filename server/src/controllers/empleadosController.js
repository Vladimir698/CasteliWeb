const db = require('../models');

exports.index = async (req, res) => {
  try {
    const empleados = await db.Empleado.findAll({
      order: [['nombre', 'ASC']],
      raw: true,
    });

    return res.render('empleados/empleados', {
      title: 'Empleados',
      empleados,
      empleadosJson: JSON.stringify(empleados),
    });
  } catch (error) {
    console.error('Error cargando empleados:', error);
    return res.status(500).send('Error interno');
  }
};

exports.crear = async (req, res) => {
  try {
    const { cedula, nombre, apellidos, ocupacion, especialidad } = req.body;

    await db.Empleado.create({
      cedula,
      nombre,
      apellidos,
      ocupacion,
      especialidad,
    });

    return res.redirect('/empleados?msg=creado');
  } catch (error) {
    console.error('Error creando empleado:', error);
    return res.status(500).send('Error creando empleado');
  }
};

exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { cedula, nombre, apellidos, ocupacion, especialidad } = req.body;

    const empleado = await db.Empleado.findByPk(id);

    if (!empleado) {
      return res.status(404).send('Empleado no encontrado');
    }

    await empleado.update({
      cedula,
      nombre,
      apellidos,
      ocupacion,
      especialidad,
    });

    return res.redirect('/empleados?msg=actualizado');
  } catch (error) {
    console.error('Error actualizando empleado:', error);
    return res.status(500).send('Error actualizando empleado');
  }
};

exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;

    const empleado = await db.Empleado.findByPk(id);

    if (!empleado) {
      return res.status(404).send('Empleado no encontrado');
    }

    await empleado.destroy();

    return res.redirect('/empleados?msg=eliminado');
  } catch (error) {
    console.error('Error eliminando empleado:', error);
    return res.status(500).send('Error eliminando empleado');
  }
};




