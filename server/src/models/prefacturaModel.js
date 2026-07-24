'use strict';

module.exports = (sequelize, DataTypes) => {
  const Prefactura = sequelize.define('Prefactura', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ordenId: { type: DataTypes.INTEGER, allowNull: true, field: 'orden_id', unique: true },
    subtotal: { type: DataTypes.DECIMAL(12,2), allowNull: true, field: 'subtotal' },
    iva: { type: DataTypes.DECIMAL(12,2), allowNull: true, field: 'iva' },
    total: { type: DataTypes.DECIMAL(12,2), allowNull: true, field: 'total' },
  }, {
    tableName: 'prefacturas',
    freezeTableName: true,
    underscored: true,
    timestamps: false
  });

  return Prefactura;
};
