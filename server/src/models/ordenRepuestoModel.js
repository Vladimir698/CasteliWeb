'use strict';

module.exports = (sequelize, DataTypes) => {
  const OrdenRepuesto = sequelize.define('OrdenRepuesto', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ordenId: { type: DataTypes.INTEGER, allowNull: true, field: 'orden_id' },
    inventarioId: { type: DataTypes.INTEGER, allowNull: true, field: 'inventario_id' },
    proveedorId: { type: DataTypes.INTEGER, allowNull: true, field: 'proveedor_id' },
    descripcion: { type: DataTypes.STRING(200), allowNull: true, field: 'descripcion' },
    cantidad: { type: DataTypes.DECIMAL(12,2), allowNull: true, field: 'cantidad' },
    costo: { type: DataTypes.DECIMAL(12,2), allowNull: true, field: 'costo' },
    precio: { type: DataTypes.DECIMAL(12,2), allowNull: true, field: 'precio' },
    descuento: { type: DataTypes.DECIMAL(12,2), allowNull: true, field: 'descuento' },
  }, {
    tableName: 'orden_repuestos',
    freezeTableName: true,
    underscored: true,
    timestamps: false
  });

  return OrdenRepuesto;
};
