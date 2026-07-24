'use strict';

module.exports = (sequelize, DataTypes) => {
  const OrdenObservacion = sequelize.define('OrdenObservacion', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ordenId: { type: DataTypes.INTEGER, allowNull: true, field: 'orden_id' },
    usuarioId: { type: DataTypes.INTEGER, allowNull: true, field: 'usuario_id' },
    observacion: { type: DataTypes.TEXT, allowNull: false, field: 'observacion' },
    createdAt: { type: DataTypes.DATE, allowNull: false, field: 'created_at', defaultValue: DataTypes.NOW },
  }, {
    tableName: 'orden_observaciones',
    freezeTableName: true,
    underscored: true,
    timestamps: false
  });

  return OrdenObservacion;
};
