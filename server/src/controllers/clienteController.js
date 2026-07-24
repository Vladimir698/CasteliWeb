'use strict';

const { Op } = require('sequelize');
const { Cliente, Vehiculo, OrdenTrabajo } = require('../models');

async function listar(req, res) {
  try {
    const busqueda = String(req.query.buscar || '').trim();

    const where = {
      activo: true
    };

    if (busqueda) {
      where[Op.or] = [
        {
          nombre: {
            [Op.iLike]: `%${busqueda}%`
          }
        },
        {
          identificacion: {
            [Op.iLike]: `%${busqueda}%`
          }
        },
        {
          telefono: {
            [Op.iLike]: `%${busqueda}%`
          }
        }
      ];
    }

    const clientes = await Cliente.findAll({
      where,
      include: [
        {
          model: Vehiculo,
          as: 'vehiculos',
          required: false,
          where: {
            activo: true
          }
        }
      ],
      order: [['nombre', 'ASC']]
    });

    return res.render('clientes/clientes', {
      titulo: 'Clientes',
      clientes,
      busqueda
    });
  } catch (error) {
    console.error('Error al listar clientes:', error);

    return res.status(500).send(
      'No fue posible cargar los clientes.'
    );
  }
}

function mostrarFormularioNuevo(req, res) {
  return res.render('clientes/nuevoCliente', {
    titulo: 'Nuevo cliente',
    cliente: {},
    errores: []
  });
}

async function crear(req, res) {
  try {
    const {
      nombre,
      identificacion,
      telefono,
      correo,
      direccion,
      notas
    } = req.body;

    if (!nombre?.trim()) {
      return res.status(400).render('clientes/nuevoCliente', {
        titulo: 'Nuevo cliente',
        cliente: req.body,
        errores: ['El nombre del cliente es obligatorio.']
      });
    }

    const cliente = await Cliente.create({
      nombre: nombre.trim(),
      identificacion: identificacion?.trim() || null,
      telefono: telefono?.trim() || null,
      correo: correo?.trim() || null,
      direccion: direccion?.trim() || null,
      notas: notas?.trim() || null
    });

    return res.redirect(`/clientes/${cliente.id}`);
  } catch (error) {
    console.error('Error al crear cliente:', error);

    return res.status(500).render('clientes/nuevoCliente', {
      titulo: 'Nuevo cliente',
      cliente: req.body,
      errores: [
        'No fue posible guardar el cliente. Revise la información.'
      ]
    });
  }
}

async function verDetalle(req, res) {
  try {
    const clienteId = Number(req.params.id);

    if (!Number.isInteger(clienteId) || clienteId <= 0) {
      return res.status(400).send('Cliente inválido.');
    }

    const cliente = await Cliente.findByPk(clienteId, {
      include: [
        {
          model: Vehiculo,
          as: 'vehiculos',
          required: false,
          include: [
            {
              model: OrdenTrabajo,
              as: 'ordenes',
              required: false
            }
          ]
        }
      ]
    });

    if (!cliente) {
      return res.status(404).send('Cliente no encontrado.');
    }

    return res.render('clientes/detalleCliente', {
      titulo: cliente.nombre,
      cliente
    });
  } catch (error) {
    console.error('Error al cargar cliente:', error);

    return res.status(500).send(
      'No fue posible cargar la información del cliente.'
    );
  }
}

module.exports = {
  listar,
  mostrarFormularioNuevo,
  crear,
  verDetalle
};