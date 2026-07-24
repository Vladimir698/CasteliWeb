'use strict';

module.exports = (sequelize, DataTypes) => {
  const OrdenDiagnostico = sequelize.define('OrdenDiagnostico', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ordenId: { type: DataTypes.INTEGER, allowNull: true, field: 'orden_id' },
    usuarioId: { type: DataTypes.INTEGER, allowNull: true, field: 'usuario_id' },
    descripcion: { type: DataTypes.TEXT, allowNull: false, field: 'descripcion' },
    createdAt: { type: DataTypes.DATE, allowNull: false, field: 'created_at', defaultValue: DataTypes.NOW },
  }, {
    tableName: 'orden_diagnosticos',
    freezeTableName: true,
    underscored: true,
    timestamps: false
  });

  return OrdenDiagnostico;
};
