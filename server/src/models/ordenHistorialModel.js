'use strict';

module.exports = (sequelize, DataTypes) => {
  const OrdenHistorial = sequelize.define('OrdenHistorial', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ordenId: { type: DataTypes.INTEGER, allowNull: true, field: 'orden_id' },
    usuarioId: { type: DataTypes.INTEGER, allowNull: true, field: 'usuario_id' },
    estadoAnteriorId: { type: DataTypes.INTEGER, allowNull: true, field: 'estado_anterior' },
    estadoNuevoId: { type: DataTypes.INTEGER, allowNull: true, field: 'estado_nuevo' },
    comentario: { type: DataTypes.TEXT, allowNull: true, field: 'comentario' },
    fecha: { type: DataTypes.DATE, allowNull: false, field: 'fecha', defaultValue: DataTypes.NOW },
  }, {
    tableName: 'orden_historial',
    freezeTableName: true,
    underscored: true,
    timestamps: false
  });

  return OrdenHistorial;
};
