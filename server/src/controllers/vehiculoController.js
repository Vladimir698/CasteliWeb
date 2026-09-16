'use strict';

const { Op } = require('sequelize');
const { Cliente, Vehiculo, OrdenTrabajo, EstadoOrden, OrdenTrabajoDetalle, OrdenRepuesto } = require('../models');

const normalizarPlaca = placa => String(placa || '').trim().toUpperCase().replace(/\s+/g, '');

function mostrarBusqueda(req, res) {
  return res.render('vehiculos/buscarVehiculo', { titulo: 'Buscar vehículo', placa: '', error: null, noEncontrado: false });
}

async function buscarPorPlaca(req, res) {
  try {
    const placa = normalizarPlaca(req.body.placa);
    if (!placa) return res.status(400).render('vehiculos/buscarVehiculo', { titulo: 'Buscar vehículo', placa, error: 'Ingrese una placa.', noEncontrado: false });
    const vehiculo = await Vehiculo.findOne({ where: { placa: { [Op.iLike]: placa } } });
    if (vehiculo) return res.redirect(`/vehiculos/${vehiculo.id}`);
    return res.render('vehiculos/buscarVehiculo', { titulo: 'Buscar vehículo', placa, error: null, noEncontrado: true });
  } catch (error) {
    console.error(error);
    return res.status(500).send('No fue posible buscar el vehículo.');
  }
}

async function mostrarFormularioNuevo(req, res) {
  const clienteSeleccionadoId = Number(req.query.clienteId) || null;
  return res.render('vehiculos/nuevoVehiculo', {
    titulo: 'Registrar vehículo', vehiculo: { placa: req.query.placa || '' }, clienteSeleccionadoId, clienteSeleccionado: clienteSeleccionadoId ? await Cliente.findByPk(clienteSeleccionadoId) : null, errores: []
  });
}

async function buscarClientes(req, res) {
  const q = String(req.query.q || '').trim();
  if (q.length < 2) return res.json([]);
  const clientes = await Cliente.findAll({
    where: { activo: true, [Op.or]: [
      { nombre: { [Op.iLike]: `%${q}%` } }, { identificacion: { [Op.iLike]: `%${q}%` } }, { telefono: { [Op.iLike]: `%${q}%` } }
    ]}, limit: 10, order: [['nombre', 'ASC']]
  });
  return res.json(clientes.map(c => ({ id: c.id, nombre: c.nombre, identificacion: c.identificacion, telefono: c.telefono })));
}

async function crear(req, res) {
  const t = await Vehiculo.sequelize.transaction();
  try {
    const placa = normalizarPlaca(req.body.placa);
    const kilometraje = Number(req.body.kilometraje_actual);
    const modelo = String(req.body.modelo || '').trim();
    const anio = req.body.anio ? Number(req.body.anio) : null;
    if (!placa || !modelo || !Number.isFinite(kilometraje) || kilometraje < 0) throw new Error('Complete placa, modelo y kilometraje correctamente.');

    const duplicado = await Vehiculo.findOne({ where: { placa: { [Op.iLike]: placa } }, transaction: t });
    if (duplicado) { await t.rollback(); return res.redirect(`/vehiculos/${duplicado.id}`); }

    let cliente = req.body.cliente_id ? await Cliente.findByPk(Number(req.body.cliente_id), { transaction: t }) : null;
    if (!cliente) {
      const nombre = String(req.body.nombre_cliente || '').trim();
      const identificacion = String(req.body.identificacion_cliente || '').trim();
      const telefono = String(req.body.telefono_cliente || '').trim();
      if (!nombre || !telefono) throw new Error('Seleccione un cliente existente o complete nombre y teléfono del nuevo cliente.');
      if (identificacion) cliente = await Cliente.findOne({ where: { identificacion }, transaction: t });
      if (!cliente) cliente = await Cliente.create({
        tipoCliente: req.body.tipo_cliente === 'empresa' ? 'empresa' : 'persona', nombre,
        identificacion: identificacion || null, telefono,
        correo: req.body.tipo_cliente === 'empresa' ? String(req.body.correo_cliente || '').trim() || null : null,
        activo: true
      }, { transaction: t });
    }

    const vehiculo = await Vehiculo.create({ clienteId: cliente.id, placa, marca: 'No indicada', modelo, anio, kilometrajeActual: kilometraje }, { transaction: t });
    await t.commit();
    return res.redirect(`/vehiculos/${vehiculo.id}`);
  } catch (error) {
    if (!t.finished) await t.rollback();
    console.error(error);
    return res.status(400).render('vehiculos/nuevoVehiculo', { titulo: 'Registrar vehículo', vehiculo: req.body, clienteSeleccionadoId: req.body.cliente_id || null, clienteSeleccionado: null, errores: [error.message] });
  }
}

async function verDetalle(req, res) {
  try {
    const vehiculo = await Vehiculo.findByPk(Number(req.params.id), { include: [
      { model: Cliente, as: 'cliente' },
      { model: OrdenTrabajo, as: 'ordenes', required: false, include: [
        { model: EstadoOrden, as: 'estado' }, { model: OrdenTrabajoDetalle, as: 'trabajos', required: false }, { model: OrdenRepuesto, as: 'repuestos', required: false }
      ]}
    ]});
    if (!vehiculo) return res.status(404).send('Vehículo no encontrado.');
    const ordenes = [...(vehiculo.ordenes || [])].sort((a,b) => new Date(b.fechaRecepcion || 0) - new Date(a.fechaRecepcion || 0));
    return res.render('vehiculos/detalleVehiculo', { titulo: vehiculo.placa, vehiculo, ordenes, ordenActual: ordenes[0] || null });
  } catch (error) {
    console.error(error);
    return res.status(500).send(`No fue posible cargar el vehículo: ${error.message}`);
  }
}

async function actualizarMantenimiento(req, res) {
  try {
    const vehiculo = await Vehiculo.findByPk(Number(req.params.id));
    if (!vehiculo) return res.status(404).send('Vehículo no encontrado.');
    await vehiculo.update({
      kilometrajeActual: Number(req.body.kilometraje_actual) || 0,
      proximoAceiteKm: req.body.proximo_aceite_km ? Number(req.body.proximo_aceite_km) : null,
      proximoAceiteFecha: req.body.proximo_aceite_fecha || null,
      proximoFrenosFecha: req.body.proximo_frenos_fecha || null
    });
    return res.redirect(`/vehiculos/${vehiculo.id}`);
  } catch (error) { console.error(error); return res.status(500).send('No fue posible guardar el mantenimiento.'); }
}

module.exports = { mostrarBusqueda, buscarPorPlaca, mostrarFormularioNuevo, buscarClientes, crear, verDetalle, actualizarMantenimiento };
