'use strict';

module.exports = (sequelize, DataTypes) => {
  const Compra = sequelize.define('Compra', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    proveedorId: { type: DataTypes.INTEGER, allowNull: true, field: 'proveedor_id' },
    numeroFactura: { type: DataTypes.STRING(60), allowNull: true, field: 'numero_factura' },
    fecha: { type: DataTypes.DATEONLY, allowNull: false, field: 'fecha', defaultValue: DataTypes.NOW },
    subtotal: { type: DataTypes.DECIMAL(12,2), allowNull: true, field: 'subtotal' },
    iva: { type: DataTypes.DECIMAL(12,2), allowNull: true, field: 'iva' },
    total: { type: DataTypes.DECIMAL(12,2), allowNull: true, field: 'total' },
  }, {
    tableName: 'compras',
    freezeTableName: true,
    underscored: true,
    timestamps: false
  });

  return Compra;
};
