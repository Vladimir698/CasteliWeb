'use strict';

const { Op } = require('sequelize');

const {
  Cliente,
  Vehiculo,
  OrdenTrabajo,
  EstadoOrden
} = require('../models');

async function listarActivas(req, res) {
  try {
    const estadosActivos = [
      'Recibida',
      'Diagnóstico',
      'Esperando aprobación',
      'Esperando repuestos',
      'Reparación',
      'Control de calidad',
      'Lista para facturar'
    ];

    const ordenes = await OrdenTrabajo.findAll({
      include: [
        {
          model: Vehiculo,
          as: 'vehiculo',
          include: [
            {
              model: Cliente,
              as: 'cliente'
            }
          ]
        },
        {
          model: EstadoOrden,
          as: 'estado',
          required: true,
          where: {
            nombre: {
              [Op.in]: estadosActivos
            }
          }
        }
      ],
      order: [
        ['fechaRecepcion', 'DESC']
      ]
    });

    return res.render('ordenes/ordenes', {
      titulo: 'Órdenes activas',
      ordenes
    });
  } catch (error) {
    console.error('ERROR AL CARGAR ÓRDENES:', error);

    return res.status(500).send(
      `No fue posible cargar las órdenes: ${error.message}`
    );
  }
}

async function mostrarFormularioNuevo(req, res) {
  try {
    const vehiculoId = Number(req.params.vehiculoId);

    if (!Number.isInteger(vehiculoId) || vehiculoId <= 0) {
      return res.status(400).send('Identificador de vehículo inválido.');
    }

    const vehiculo = await Vehiculo.findByPk(vehiculoId, {
      include: [
        {
          model: Cliente,
          as: 'cliente'
        }
      ]
    });

    if (!vehiculo) {
      return res.status(404).send('Vehículo no encontrado.');
    }

    return res.render('ordenes/nuevaOrden', {
      titulo: 'Nueva orden de trabajo',
      vehiculo,
      orden: {},
      errores: []
    });
  } catch (error) {
    console.error('Error al abrir orden:', error);

    return res.status(500).send(
      'No fue posible abrir el formulario.'
    );
  }
}

async function crear(req, res) {
  try {
    const vehiculoId = Number(req.params.vehiculoId);

    const {
      kilometraje_ingreso,
      nivel_combustible,
      problema_reportado,
      observaciones
    } = req.body;

    if (!Number.isInteger(vehiculoId) || vehiculoId <= 0) {
      return res.status(400).send('Identificador de vehículo inválido.');
    }

    const vehiculo = await Vehiculo.findByPk(vehiculoId, {
      include: [
        {
          model: Cliente,
          as: 'cliente'
        }
      ]
    });

    if (!vehiculo) {
      return res.status(404).send('Vehículo no encontrado.');
    }

    const errores = [];
    const kilometraje = Number(kilometraje_ingreso);

    if (
      kilometraje_ingreso === undefined ||
      kilometraje_ingreso === '' ||
      !Number.isFinite(kilometraje) ||
      kilometraje < 0
    ) {
      errores.push('Debe indicar un kilometraje válido.');
    }

    if (!problema_reportado?.trim()) {
      errores.push(
        'Debe indicar el problema reportado por el cliente.'
      );
    }

    if (errores.length) {
      return res.status(400).render('ordenes/nuevaOrden', {
        titulo: 'Nueva orden de trabajo',
        vehiculo,
        orden: req.body,
        errores
      });
    }

    const estadoRecibida = await EstadoOrden.findOne({
      where: {
        nombre: 'Recibida'
      }
    });

    if (!estadoRecibida) {
      return res.status(500).send(
        'No existe el estado inicial "Recibida".'
      );
    }

    const numeroOrden = await generarNumeroOrden();

    const orden = await OrdenTrabajo.create({
      numeroOrden,
      vehiculoId,
      estadoId: estadoRecibida.id,

      usuarioRecepcionaId: null,

      kilometrajeIngreso: kilometraje,
      nivelCombustible:
        nivel_combustible?.trim() || null,

      problemaReportado:
        problema_reportado.trim(),

      observaciones:
        observaciones?.trim() || null,

      prioridad: 'Normal'
    });

    await vehiculo.update({
      kilometrajeActual: kilometraje
    });

    return res.redirect(`/ordenes/${orden.id}`);
  } catch (error) {
    console.error('Error al crear orden:', error);

    return res.status(500).send(
      `No fue posible crear la orden de trabajo: ${error.message}`
    );
  }
}

async function verDetalle(req, res) {
  try {
    const ordenId = Number(req.params.id);

    if (!Number.isInteger(ordenId) || ordenId <= 0) {
      return res.status(400).send('Identificador de orden inválido.');
    }

    const orden = await OrdenTrabajo.findByPk(ordenId, {
      include: [
        {
          model: Vehiculo,
          as: 'vehiculo',
          include: [
            {
              model: Cliente,
              as: 'cliente'
            }
          ]
        },
        {
          model: EstadoOrden,
          as: 'estado'
        }
      ]
    });

    if (!orden) {
      return res.status(404).send('Orden no encontrada.');
    }

    return res.render('ordenes/detalleOrden', {
      titulo: orden.numeroOrden,
      orden
    });
  } catch (error) {
    console.error('Error al cargar orden:', error);

    return res.status(500).send(
      `No fue posible cargar la orden: ${error.message}`
    );
  }
}

async function generarNumeroOrden() {
  const anio = new Date().getFullYear();

  const ultimaOrden = await OrdenTrabajo.findOne({
    where: {
      numeroOrden: {
        [Op.like]: `OT-${anio}-%`
      }
    },
    order: [
      ['id', 'DESC']
    ]
  });

  let consecutivo = 1;

  if (ultimaOrden) {
    const partes = ultimaOrden.numeroOrden.split('-');
    consecutivo = Number(partes[2] || 0) + 1;
  }

  return `OT-${anio}-${String(consecutivo).padStart(4, '0')}`;
}

module.exports = {
  listarActivas,
  mostrarFormularioNuevo,
  crear,
  verDetalle
};