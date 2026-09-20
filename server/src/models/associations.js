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

  db.OrdenTrabajo.hasMany(db.OrdenTrabajoDetalle, { foreignKey: 'orden_id', as: 'trabajos' });
  db.OrdenTrabajoDetalle.belongsTo(db.OrdenTrabajo, { foreignKey: 'orden_id', as: 'orden' });
  db.OrdenTrabajoDetalle.belongsTo(db.Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

  db.OrdenTrabajo.hasMany(db.OrdenRepuesto, { foreignKey: 'orden_id', as: 'repuestos' });
  db.OrdenRepuesto.belongsTo(db.OrdenTrabajo, { foreignKey: 'orden_id', as: 'orden' });
};
