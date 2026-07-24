'use strict';

module.exports = (sequelize, DataTypes) => {
  const OrdenTrabajo = sequelize.define('OrdenTrabajo', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    numeroOrden: { type: DataTypes.STRING(30), allowNull: false, field: 'numero_orden', unique: true },
    vehiculoId: { type: DataTypes.INTEGER, allowNull: true, field: 'vehiculo_id' },
    estadoId: { type: DataTypes.INTEGER, allowNull: true, field: 'estado_id' },
    usuarioRecepcionaId: { type: DataTypes.INTEGER, allowNull: true, field: 'usuario_recepciona' },
    usuarioAsignadoId: { type: DataTypes.INTEGER, allowNull: true, field: 'usuario_asignado' },
    fechaRecepcion: { type: DataTypes.DATE, allowNull: false, field: 'fecha_recepcion', defaultValue: DataTypes.NOW },
    fechaInicio: { type: DataTypes.DATE, allowNull: true, field: 'fecha_inicio' },
    fechaFin: { type: DataTypes.DATE, allowNull: true, field: 'fecha_fin' },
    kilometrajeIngreso: { type: DataTypes.INTEGER, allowNull: false, field: 'kilometraje_ingreso' },
    nivelCombustible: { type: DataTypes.STRING(30), allowNull: true, field: 'nivel_combustible' },
    prioridad: { type: DataTypes.STRING(20), allowNull: false, field: 'prioridad', defaultValue: 'Normal' },
    problemaReportado: { type: DataTypes.TEXT, allowNull: false, field: 'problema_reportado' },
    observaciones: { type: DataTypes.TEXT, allowNull: true, field: 'observaciones' },
  }, {
    tableName: 'ordenes_trabajo',
    freezeTableName: true,
    underscored: true,
    timestamps: true
  });

  return OrdenTrabajo;
};
