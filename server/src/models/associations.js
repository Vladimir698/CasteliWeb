'use strict';

module.exports = db => {
  db.Rol.hasMany(db.Usuario, { foreignKey: 'rol_id', as: 'usuarios' });
  db.Usuario.belongsTo(db.Rol, { foreignKey: 'rol_id', as: 'rol' });

  db.Cliente.hasMany(db.Vehiculo, { foreignKey: 'cliente_id', as: 'vehiculos' });
  db.Vehiculo.belongsTo(db.Cliente, { foreignKey: 'cliente_id', as: 'cliente' });

  db.Vehiculo.hasMany(db.OrdenTrabajo, { foreignKey: 'vehiculo_id', as: 'ordenes' });
  db.OrdenTrabajo.belongsTo(db.Vehiculo, { foreignKey: 'vehiculo_id', as: 'vehiculo' });

  db.EstadoOrden.hasMany(db.OrdenTrabajo, { foreignKey: 'estado_id', as: 'ordenes' });
  db.OrdenTrabajo.belongsTo(db.EstadoOrden, { foreignKey: 'estado_id', as: 'estado' });

  db.OrdenTrabajo.belongsTo(db.Usuario, { foreignKey: 'usuario_recepciona', as: 'usuarioRecepciona' });
  db.OrdenTrabajo.belongsTo(db.Usuario, { foreignKey: 'usuario_asignado', as: 'usuarioAsignado' });

  db.OrdenTrabajo.hasMany(db.OrdenHistorial, { foreignKey: 'orden_id', as: 'historial' });
  db.OrdenHistorial.belongsTo(db.OrdenTrabajo, { foreignKey: 'orden_id', as: 'orden' });
  db.OrdenHistorial.belongsTo(db.Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
  db.OrdenHistorial.belongsTo(db.EstadoOrden, { foreignKey: 'estado_anterior', as: 'estadoAnterior' });
  db.OrdenHistorial.belongsTo(db.EstadoOrden, { foreignKey: 'estado_nuevo', as: 'estadoNuevo' });

  db.OrdenTrabajo.hasMany(db.OrdenDiagnostico, { foreignKey: 'orden_id', as: 'diagnosticos' });
  db.OrdenDiagnostico.belongsTo(db.OrdenTrabajo, { foreignKey: 'orden_id', as: 'orden' });
  db.OrdenDiagnostico.belongsTo(db.Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

  db.OrdenTrabajo.hasMany(db.OrdenTrabajoDetalle, { foreignKey: 'orden_id', as: 'trabajos' });
  db.OrdenTrabajoDetalle.belongsTo(db.OrdenTrabajo, { foreignKey: 'orden_id', as: 'orden' });
  db.OrdenTrabajoDetalle.belongsTo(db.Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

  db.OrdenTrabajo.hasMany(db.OrdenObservacion, { foreignKey: 'orden_id', as: 'observacionesOrden' });
  db.OrdenObservacion.belongsTo(db.OrdenTrabajo, { foreignKey: 'orden_id', as: 'orden' });
  db.OrdenObservacion.belongsTo(db.Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

  db.OrdenTrabajo.hasMany(db.OrdenFoto, { foreignKey: 'orden_id', as: 'fotos' });
  db.OrdenFoto.belongsTo(db.OrdenTrabajo, { foreignKey: 'orden_id', as: 'orden' });

  db.OrdenTrabajo.hasMany(db.OrdenRepuesto, { foreignKey: 'orden_id', as: 'repuestos' });
  db.OrdenRepuesto.belongsTo(db.OrdenTrabajo, { foreignKey: 'orden_id', as: 'orden' });
  db.OrdenRepuesto.belongsTo(db.Inventario, { foreignKey: 'inventario_id', as: 'productoInventario' });
  db.OrdenRepuesto.belongsTo(db.Proveedor, { foreignKey: 'proveedor_id', as: 'proveedor' });

  db.Proveedor.hasMany(db.Compra, { foreignKey: 'proveedor_id', as: 'compras' });
  db.Compra.belongsTo(db.Proveedor, { foreignKey: 'proveedor_id', as: 'proveedor' });
  db.Compra.hasMany(db.CompraDetalle, { foreignKey: 'compra_id', as: 'detalles' });
  db.CompraDetalle.belongsTo(db.Compra, { foreignKey: 'compra_id', as: 'compra' });
  db.CompraDetalle.belongsTo(db.Inventario, { foreignKey: 'inventario_id', as: 'productoInventario' });

  db.OrdenTrabajo.hasOne(db.Prefactura, { foreignKey: 'orden_id', as: 'prefactura' });
  db.Prefactura.belongsTo(db.OrdenTrabajo, { foreignKey: 'orden_id', as: 'orden' });
};
