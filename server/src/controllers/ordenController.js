'use strict';

const {
  Cliente,
  Vehiculo,
  OrdenTrabajo
} = require('../models');

async function listarActivas(req, res) {
  try {
    const ordenes = await OrdenTrabajo.findAll({
      where: {
        estado: [
          'recibida',
          'diagnostico',
          'esperando_aprobacion',
          'esperando_repuestos',
          'reparacion',
          'lista_para_facturar'
        ]
      },
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
        }
      ],
      order: [['fecha_ingreso', 'DESC']]
    });

    return res.render('ordenes/index', {
      titulo: 'Órdenes activas',
      ordenes
    });
  } catch (error) {
    console.error('Error al listar órdenes:', error);

    return res.status(500).send(
      'No fue posible cargar las órdenes.'
    );
  }
}

async function mostrarFormularioNuevo(req, res) {
  try {
    const vehiculoId = Number(req.params.vehiculoId);

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

    return res.render('ordenes/nueva', {
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

    if (
      !kilometraje_ingreso ||
      Number(kilometraje_ingreso) < 0
    ) {
      errores.push('Debe indicar un kilometraje válido.');
    }

    if (!problema_reportado?.trim()) {
      errores.push(
        'Debe indicar el problema reportado por el cliente.'
      );
    }

    if (errores.length) {
      return res.status(400).render('ordenes/nueva', {
        titulo: 'Nueva orden de trabajo',
        vehiculo,
        orden: req.body,
        errores
      });
    }

    const numeroOrden = await generarNumeroOrden();

    const orden = await OrdenTrabajo.create({
      numero_orden: numeroOrden,
      vehiculo_id: vehiculoId,
      creada_por: req.session.usuario?.id || null,
      kilometraje_ingreso: Number(kilometraje_ingreso),
      nivel_combustible: nivel_combustible || null,
      problema_reportado: problema_reportado.trim(),
      observaciones: observaciones?.trim() || null,
      estado: 'recibida'
    });

    await vehiculo.update({
      kilometraje_actual: Number(kilometraje_ingreso)
    });

    return res.redirect(`/ordenes/${orden.id}`);
  } catch (error) {
    console.error('Error al crear orden:', error);

    return res.status(500).send(
      'No fue posible crear la orden de trabajo.'
    );
  }
}

async function verDetalle(req, res) {
  try {
    const ordenId = Number(req.params.id);

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
        }
      ]
    });

    if (!orden) {
      return res.status(404).send('Orden no encontrada.');
    }

    return res.render('ordenes/detalle', {
      titulo: orden.numero_orden,
      orden
    });
  } catch (error) {
    console.error('Error al cargar orden:', error);

    return res.status(500).send(
      'No fue posible cargar la orden.'
    );
  }
}

async function generarNumeroOrden() {
  const anio = new Date().getFullYear();

  const ultimaOrden = await OrdenTrabajo.findOne({
    where: {
      numero_orden: {
        [require('sequelize').Op.like]: `OT-${anio}-%`
      }
    },
    order: [['id', 'DESC']]
  });

  let consecutivo = 1;

  if (ultimaOrden) {
    const partes = ultimaOrden.numero_orden.split('-');
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