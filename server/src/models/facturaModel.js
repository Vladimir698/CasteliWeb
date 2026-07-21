'use strict';

module.exports = (sequelize, DataTypes) => {
  const Factura = sequelize.define('Factura', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    numero_factura: { type: DataTypes.STRING(50), allowNull: false },
    proveedor: { type: DataTypes.STRING(150), allowNull: true },
    monto: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    cheque_id: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    tableName: 'facturas',
    timestamps: false,
  });

  return Factura;
};