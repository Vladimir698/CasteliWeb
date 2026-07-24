'use strict';

module.exports = (sequelize, DataTypes) => {
  const OrdenTrabajoDetalle = sequelize.define('OrdenTrabajoDetalle', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ordenId: { type: DataTypes.INTEGER, allowNull: true, field: 'orden_id' },
    usuarioId: { type: DataTypes.INTEGER, allowNull: true, field: 'usuario_id' },
    descripcion: { type: DataTypes.TEXT, allowNull: false, field: 'descripcion' },
    fechaInicio: { type: DataTypes.DATE, allowNull: true, field: 'fecha_inicio' },
    fechaFin: { type: DataTypes.DATE, allowNull: true, field: 'fecha_fin' },
    estado: { type: DataTypes.STRING(30), allowNull: true, field: 'estado' },
  }, {
    tableName: 'orden_trabajos',
    freezeTableName: true,
    underscored: true,
    timestamps: false
  });

  return OrdenTrabajoDetalle;
};
