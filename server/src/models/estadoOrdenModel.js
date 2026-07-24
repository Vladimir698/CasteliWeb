'use strict';

module.exports = (sequelize, DataTypes) => {
  const EstadoOrden = sequelize.define('EstadoOrden', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING(60), allowNull: false, field: 'nombre', unique: true },
  }, {
    tableName: 'estados_orden',
    freezeTableName: true,
    underscored: true,
    timestamps: false
  });

  return EstadoOrden;
};
