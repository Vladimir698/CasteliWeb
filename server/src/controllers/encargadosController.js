const db = require('../models');

exports.index = async (req, res) => {
  try {
    const estudiantes = await db.Estudiante.findAll({
      attributes: ['id', 'cedula', 'nombre', 'apellidos', 'estado'],
      order: [['nombre', 'ASC']],
    });

    const estudianteSeleccionado = req.query.estudiante || null;

    return res.render('encargados/encargadosEstudiantes', {
      title: 'Encargados',
      estudiantes,
      estudianteSeleccionado
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Error');
  }
};

exports.getByEstudiante = async (req, res) => {
  try {
    const { id } = req.params;

    const encargados = await db.Encargado.findAll({
      where: { estudiante_id: id },
      order: [['id', 'DESC']],
      raw: true,
    });

    const anioActual = new Date().getFullYear();

    const encargadosConPagos = await Promise.all(
      encargados.map(async (enc) => {
        const pagos = await db.PagoMensual.findAll({
          where: {
            encargado_id: enc.id,
            estudiante_id: id,
            anio: anioActual,
          },
          raw: true,
        });

        return {
          ...enc,
          pagos,
        };
      })
    );

    return res.json(encargadosConPagos);

  } catch (error) {
    console.error('Error getByEstudiante:', error);
    return res.status(500).json([]);
  }
};

exports.crear = async (req, res) => {
  try {
    const {
      estudiante_id,
      cedula,
      nombre,
      apellidos,
      parentesco,
      telefono,
      correo,
      ocupacion,
      lugar_trabajo
    } = req.body;

    if (!estudiante_id) {
      return res.status(400).json({ ok: false, message: 'Falta estudiante_id' });
    }

    const total = await db.Encargado.count({
      where: { estudiante_id }
    });

    if (total >= 2) {
      return res.status(400).json({
        ok: false,
        message: 'Este estudiante ya tiene 2 encargados asignados.'
      });
    }

    const nuevo = await db.Encargado.create({
      estudiante_id,
      cedula,
      nombre,
      apellidos,
      parentesco,
      telefono,
      correo,
      ocupacion,
      lugar_trabajo,
      estado: true,
    });

    return res.json({ ok: true, encargado: nuevo });

  } catch (error) {
    console.error('Error creando encargado:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno creando encargado.'
    });
  }
};

exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      cedula,
      nombre,
      apellidos,
      parentesco,
      telefono,
      correo,
      ocupacion,
      lugar_trabajo,
      estado
    } = req.body;

    const enc = await db.Encargado.findByPk(id);

    if (!enc) {
      return res.status(404).json({
        ok: false,
        message: 'Encargado no encontrado.'
      });
    }

    await enc.update({
      cedula,
      nombre,
      apellidos,
      parentesco,
      telefono,
      correo,
      ocupacion,
      lugar_trabajo,
      estado: estado === 'true' || estado === true
    });

    return res.json({
      ok: true,
      encargado: enc
    });

  } catch (error) {
    console.error('Error actualizando encargado:', error);

    return res.status(500).json({
      ok: false,
      message: 'Error interno actualizando encargado.'
    });
  }
};

exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    const enc = await db.Encargado.findByPk(id);

    if (!enc) {
      return res.status(404).json({ ok: false });
    }

    await enc.destroy();

    return res.json({ ok: true });

  } catch (error) {
    console.error('Error eliminando encargado:', error);
    return res.status(500).json({ ok: false });
  }
};

exports.toggleEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const enc = await db.Encargado.findByPk(id);

    if (!enc) {
      return res.status(404).json({ ok: false });
    }

    await enc.update({ estado: !enc.estado });

    return res.json({ ok: true, estado: enc.estado });

  } catch (error) {
    console.error('Error toggleEstado:', error);
    return res.status(500).json({ ok: false });
  }
};

exports.registrarPago = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      estudiante_id,
      mes,
      anio,
      fecha_pago,
      monto,
      forma_pago,
      observacion
    } = req.body;

    const encargado = await db.Encargado.findByPk(id);

    if (!encargado) {
      return res.status(404).json({
        ok: false,
        message: 'Encargado no encontrado.'
      });
    }

    if (!estudiante_id || !mes || !anio) {
      return res.status(400).json({
        ok: false,
        message: 'Debe indicar estudiante, mes y año.'
      });
    }

    const usuarioId = req.session.usuario ? req.session.usuario.id : null;

    const pagoExistente = await db.PagoMensual.findOne({
      where: {
        encargado_id: id,
        estudiante_id,
        mes: Number(mes),
        anio: Number(anio),
      }
    });

    if (pagoExistente) {
      await pagoExistente.update({
        fecha_pago: fecha_pago || new Date(),
        monto: monto ? Number(monto) : null,
        forma_pago,
        observacion,
        usuario_id: usuarioId,
      });

      return res.json({
        ok: true,
        message: 'Pago actualizado correctamente.',
        pago: pagoExistente
      });
    }

    const nuevoPago = await db.PagoMensual.create({
      encargado_id: Number(id),
      estudiante_id: Number(estudiante_id),
      mes: Number(mes),
      anio: Number(anio),
      fecha_pago: fecha_pago || new Date(),
      monto: monto ? Number(monto) : null,
      forma_pago,
      observacion,
      usuario_id: usuarioId,
    });

    return res.json({
      ok: true,
      message: 'Pago registrado correctamente.',
      pago: nuevoPago
    });

  } catch (error) {
    console.error('Error registrando pago:', error);

    return res.status(500).json({
      ok: false,
      message: 'Error interno registrando pago.'
    });
  }
};

exports.eliminarPago = async (req, res) => {
  try {
    const { id } = req.params;

    const pago = await db.PagoMensual.findByPk(id);

    if (!pago) {
      return res.status(404).json({
        ok: false,
        message: 'Pago no encontrado.'
      });
    }

    await pago.destroy();

    return res.json({
      ok: true,
      message: 'Pago eliminado correctamente.'
    });

  } catch (error) {
    console.error('Error eliminando pago:', error);

    return res.status(500).json({
      ok: false,
      message: 'Error interno eliminando pago.'
    });
  }
};


exports.registrarPago = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      estudiante_id,
      mes,
      anio,
      fecha_pago,
      monto,
      forma_pago,
      observacion
    } = req.body;

    const encargado = await db.Encargado.findByPk(id);

    if (!encargado) {
      return res.status(404).json({
        ok: false,
        message: 'Encargado no encontrado.'
      });
    }

    if (!estudiante_id || !mes || !anio) {
      return res.status(400).json({
        ok: false,
        message: 'Debe indicar estudiante, mes y año.'
      });
    }

    const usuarioId = req.session.usuario ? req.session.usuario.id : null;

    const pagoExistente = await db.PagoMensual.findOne({
      where: {
        encargado_id: Number(id),
        estudiante_id: Number(estudiante_id),
        mes: Number(mes),
        anio: Number(anio)
      }
    });

    if (pagoExistente) {
      await pagoExistente.update({
        fecha_pago: fecha_pago || new Date(),
        monto: monto ? Number(monto) : null,
        forma_pago,
        observacion,
        usuario_id: usuarioId
      });

      return res.json({
        ok: true,
        message: 'Pago actualizado correctamente.',
        pago: pagoExistente
      });
    }

    const nuevoPago = await db.PagoMensual.create({
      encargado_id: Number(id),
      estudiante_id: Number(estudiante_id),
      mes: Number(mes),
      anio: Number(anio),
      fecha_pago: fecha_pago || new Date(),
      monto: monto ? Number(monto) : null,
      forma_pago,
      observacion,
      usuario_id: usuarioId
    });

    return res.json({
      ok: true,
      message: 'Pago registrado correctamente.',
      pago: nuevoPago
    });

  } catch (error) {
    console.error('Error registrando pago:', error);

    return res.status(500).json({
      ok: false,
      message: 'Error interno registrando pago.'
    });
  }
};

exports.eliminarPago = async (req, res) => {
  try {
    const { id } = req.params;

    const pago = await db.PagoMensual.findByPk(id);

    if (!pago) {
      return res.status(404).json({
        ok: false,
        message: 'Pago no encontrado.'
      });
    }

    await pago.destroy();

    return res.json({
      ok: true,
      message: 'Pago eliminado correctamente.'
    });

  } catch (error) {
    console.error('Error eliminando pago:', error);

    return res.status(500).json({
      ok: false,
      message: 'Error interno eliminando pago.'
    });
  }
};