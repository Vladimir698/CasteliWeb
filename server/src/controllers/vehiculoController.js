'use strict';

const {
  Cliente,
  Vehiculo,
  OrdenTrabajo
} = require('../models');

async function mostrarFormularioNuevo(req, res) {
  try {
    const clienteId = Number(req.params.clienteId);

    const cliente = await Cliente.findByPk(clienteId);

    if (!cliente) {
      return res.status(404).send('Cliente no encontrado.');
    }

    return res.render('vehiculos/nuevo', {
      titulo: 'Registrar vehículo',
      cliente,
      vehiculo: {},
      errores: []
    });
  } catch (error) {
    console.error('Error al abrir formulario:', error);

    return res.status(500).send(
      'No fue posible abrir el formulario.'
    );
  }
}

async function crear(req, res) {
  try {
    const clienteId = Number(req.params.clienteId);

    const {
      placa,
      marca,
      modelo,
      anio,
      motor,
      vin,
      color,
      kilometraje_actual,
      notas
    } = req.body;

    const cliente = await Cliente.findByPk(clienteId);

    if (!cliente) {
      return res.status(404).send('Cliente no encontrado.');
    }

    const errores = [];

    if (!placa?.trim()) {
      errores.push('La placa es obligatoria.');
    }

    if (!marca?.trim()) {
      errores.push('La marca es obligatoria.');
    }

    if (!modelo?.trim()) {
      errores.push('El modelo es obligatorio.');
    }

    if (errores.length) {
      return res.status(400).render('vehiculos/nuevo', {
        titulo: 'Registrar vehículo',
        cliente,
        vehiculo: req.body,
        errores
      });
    }

    const vehiculo = await Vehiculo.create({
      cliente_id: clienteId,
      placa: placa.trim().toUpperCase(),
      marca: marca.trim(),
      modelo: modelo.trim(),
      anio: anio ? Number(anio) : null,
      motor: motor?.trim() || null,
      vin: vin?.trim() || null,
      color: color?.trim() || null,
      kilometraje_actual: kilometraje_actual
        ? Number(kilometraje_actual)
        : null,
      notas: notas?.trim() || null
    });

    return res.redirect(`/vehiculos/${vehiculo.id}`);
  } catch (error) {
    console.error('Error al crear vehículo:', error);

    return res.status(500).send(
      'No fue posible registrar el vehículo.'
    );
  }
}

async function verDetalle(req, res) {
  try {
    const vehiculoId = Number(req.params.id);

    const vehiculo = await Vehiculo.findByPk(vehiculoId, {
      include: [
        {
          model: Cliente,
          as: 'cliente'
        },
        {
          model: OrdenTrabajo,
          as: 'ordenes',
          required: false,
          order: [['fecha_ingreso', 'DESC']]
        }
      ]
    });

    if (!vehiculo) {
      return res.status(404).send('Vehículo no encontrado.');
    }

    const ordenes = [...(vehiculo.ordenes || [])].sort(
      (a, b) =>
        new Date(b.fecha_ingreso) -
        new Date(a.fecha_ingreso)
    );

    let kilometrosRecorridos = 0;

    if (ordenes.length >= 2) {
      const kilometrajeMasReciente =
        ordenes[0].kilometraje_ingreso;

      const kilometrajeMasAntiguo =
        ordenes[ordenes.length - 1].kilometraje_ingreso;

      kilometrosRecorridos =
        kilometrajeMasReciente - kilometrajeMasAntiguo;
    }

    return res.render('vehiculos/detalle', {
      titulo: `${vehiculo.placa} - ${vehiculo.marca}`,
      vehiculo,
      ordenes,
      kilometrosRecorridos
    });
  } catch (error) {
    console.error('Error al cargar vehículo:', error);

    return res.status(500).send(
      'No fue posible cargar el vehículo.'
    );
  }
}

module.exports = {
  mostrarFormularioNuevo,
  crear,
  verDetalle
};