'use strict';

module.exports = (sequelize, DataTypes) => {
  const OrdenRepuesto = sequelize.define('OrdenRepuesto', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ordenId: { type: DataTypes.INTEGER, allowNull: false, field: 'orden_id' },
    inventarioId: { type: DataTypes.INTEGER, allowNull: true, field: 'inventario_id' },
    proveedorId: { type: DataTypes.INTEGER, allowNull: true, field: 'proveedor_id' },
    descripcion: { type: DataTypes.STRING(200), allowNull: false, field: 'descripcion' },
    cantidad: { type: DataTypes.DECIMAL(12,2), allowNull: false, field: 'cantidad', defaultValue: 1 },
    costo: { type: DataTypes.DECIMAL(12,2), allowNull: true, field: 'costo' },
    precio: { type: DataTypes.DECIMAL(12,2), allowNull: false, field: 'precio', defaultValue: 0 },
    descuento: { type: DataTypes.DECIMAL(12,2), allowNull: false, field: 'descuento', defaultValue: 0 }
  }, {
    tableName: 'orden_repuestos',
    freezeTableName: true,
    underscored: true,
    timestamps: false
  });

  return OrdenRepuesto;
};
