'use strict';

const { Op } = require('sequelize');
const { Cliente, Vehiculo, OrdenTrabajo, EstadoOrden, OrdenTrabajoDetalle, OrdenRepuesto } = require('../models');

const normalizarPlaca = placa => String(placa || '').trim().toUpperCase().replace(/\s+/g, '');

async function mostrarBusqueda(req, res) {
  try {
    const vehiculos = await Vehiculo.findAll({
      include: [{ model: Cliente, as: 'cliente', required: false }],
      order: [['createdAt', 'DESC'], ['id', 'DESC']]
    });
    return res.render('vehiculos/buscarVehiculo', { titulo: 'Buscar vehículo', placa: '', error: null, noEncontrado: false, vehiculos });
  } catch (error) {
    console.error(error);
    return res.status(500).send('No fue posible cargar los vehículos.');
  }
}

async function buscarPorPlaca(req, res) {
  try {
    const placa = normalizarPlaca(req.body.placa);
    if (!placa) return res.redirect('/vehiculos/buscar');
    const vehiculo = await Vehiculo.findOne({ where: { placa: { [Op.iLike]: placa } } });
    if (vehiculo) return res.redirect(`/vehiculos/${vehiculo.id}`);
    const vehiculos = await Vehiculo.findAll({
      include: [{ model: Cliente, as: 'cliente', required: false }],
      order: [['createdAt', 'DESC'], ['id', 'DESC']]
    });
    return res.render('vehiculos/buscarVehiculo', { titulo: 'Buscar vehículo', placa, error: null, noEncontrado: true, vehiculos });
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
  return res.json(clientes.map(c => ({ id: c.id, nombre: c.nombre, identificacion: c.identificacion, telefono: c.telefono, tipoCliente: c.tipoCliente, correo: c.correo, codigoTrabajo: c.codigoTrabajo })));
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

    const clienteId = Number(req.body.cliente_id) || null;
    let cliente = clienteId ? await Cliente.findByPk(clienteId, { transaction: t }) : null;

    if (clienteId && !cliente) throw new Error('El propietario seleccionado ya no existe. Selecciónelo nuevamente.');

    if (!cliente) {
      const nombre = String(req.body.nombre_cliente || '').trim();
      const identificacion = String(req.body.identificacion_cliente || '').trim();
      const telefono = String(req.body.telefono_cliente || '').trim();
      const tipoCliente = req.body.tipo_cliente === 'empresa' ? 'empresa' : 'persona';

      if (!nombre || !telefono) throw new Error('Complete nombre y teléfono del propietario.');

      // Un vehículo nuevo sin propietario seleccionado SIEMPRE crea el propietario
      // escrito en el formulario. No se sustituye silenciosamente por otro cliente
      // que tenga una identificación coincidente.
      cliente = await Cliente.create({
        tipoCliente,
        nombre,
        identificacion: identificacion || null,
        telefono,
        correo: tipoCliente === 'empresa' ? String(req.body.correo_cliente || '').trim() || null : null,
        codigoTrabajo: tipoCliente === 'empresa' ? String(req.body.codigo_trabajo || '').trim() || null : null,
        activo: true
      }, { transaction: t });
    } else if (cliente.tipoCliente === 'empresa') {
      const codigoTrabajo = String(req.body.codigo_trabajo || '').trim();
      if (codigoTrabajo && codigoTrabajo !== (cliente.codigoTrabajo || '')) {
        await cliente.update({ codigoTrabajo }, { transaction: t });
      }
    }

    const vehiculo = await Vehiculo.create({
      clienteId: cliente.id,
      placa,
      marca: 'No indicada',
      modelo,
      anio,
      kilometrajeActual: kilometraje
    }, { transaction: t });

    await t.commit();
    return res.redirect(`/vehiculos/${vehiculo.id}`);
  } catch (error) {
    if (!t.finished) await t.rollback();
    console.error(error);
    return res.status(400).render('vehiculos/nuevoVehiculo', {
      titulo: 'Registrar vehículo',
      vehiculo: req.body,
      clienteSeleccionadoId: req.body.cliente_id || null,
      clienteSeleccionado: null,
      errores: [error.message]
    });
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
    const estadosCerrados = new Set(['Finalizada','Entregada','Cancelada']);
    const ordenActual = ordenes.find(o => !estadosCerrados.has(o.estado?.nombre)) || null;
    return res.render('vehiculos/detalleVehiculo', { titulo: vehiculo.placa, vehiculo, ordenes, ordenActual });
  } catch (error) {
    console.error(error);
    return res.status(500).send(`No fue posible cargar el vehículo: ${error.message}`);
  }
}

async function actualizarMantenimiento(req, res) {
  try {
    const vehiculo = await Vehiculo.findByPk(Number(req.params.id));
    if (!vehiculo) return res.status(404).send('Vehículo no encontrado.');
    const numeroOpcional = v => v === undefined || v === null || String(v).trim() === '' ? null : Math.max(0, Number(v) || 0);
    const kilometrajeActual = Math.max(0, Number(req.body.kilometraje_actual) || 0);
    const intervaloAceiteKm = numeroOpcional(req.body.intervalo_aceite_km);
    const intervaloAceiteMeses = numeroOpcional(req.body.intervalo_aceite_meses);
    const intervaloRevisionKm = numeroOpcional(req.body.intervalo_revision_km);
    const ultimaRevisionKm = numeroOpcional(req.body.ultima_revision_km);
    const ultimoAceiteFecha = req.body.ultimo_aceite_fecha || null;
    const ultimoFrenosFecha = req.body.ultimo_frenos_fecha || null;
    const sumarMeses = (fechaBase, meses) => {
      if (!fechaBase || !meses) return null;
      const base = new Date(fechaBase + 'T12:00:00');
      base.setMonth(base.getMonth() + meses);
      return base.toISOString().slice(0, 10);
    };
    await vehiculo.update({
      kilometrajeActual,
      intervaloAceiteKm,
      intervaloAceiteMeses,
      ultimoAceiteFecha,
      ultimoFrenosFecha,
      intervaloFrenosMeses: 12,
      intervaloRevisionKm,
      ultimaRevisionKm,
      proximoAceiteKm: intervaloAceiteKm ? kilometrajeActual + intervaloAceiteKm : null,
      proximoAceiteFecha: sumarMeses(ultimoAceiteFecha, intervaloAceiteMeses),
      proximoFrenosFecha: sumarMeses(ultimoFrenosFecha, 12),
      proximaRevisionKm: intervaloRevisionKm && ultimaRevisionKm !== null ? ultimaRevisionKm + intervaloRevisionKm : null
    });
    return res.redirect(`/vehiculos/${vehiculo.id}#mantenimiento`);
  } catch (error) { console.error(error); return res.status(500).send('No fue posible guardar el mantenimiento.'); }
}

module.exports = { mostrarBusqueda, buscarPorPlaca, mostrarFormularioNuevo, buscarClientes, crear, verDetalle, actualizarMantenimiento };
