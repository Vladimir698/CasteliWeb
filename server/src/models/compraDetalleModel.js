'use strict';

module.exports = (sequelize, DataTypes) => {
  const CompraDetalle = sequelize.define('CompraDetalle', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    compraId: { type: DataTypes.INTEGER, allowNull: true, field: 'compra_id' },
    inventarioId: { type: DataTypes.INTEGER, allowNull: true, field: 'inventario_id' },
    descripcion: { type: DataTypes.STRING(200), allowNull: true, field: 'descripcion' },
    cantidad: { type: DataTypes.DECIMAL(12,2), allowNull: true, field: 'cantidad' },
    costo: { type: DataTypes.DECIMAL(12,2), allowNull: true, field: 'costo' },
  }, {
    tableName: 'compras_detalle',
    freezeTableName: true,
    underscored: true,
    timestamps: false
  });

  return CompraDetalle;
};
